export const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export const HOURLY_VARIABLES = Object.freeze([
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_gusts_10m",
  "uv_index",
]);

export const CURRENT_VARIABLES = Object.freeze([
  "temperature_2m",
  "apparent_temperature",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_gusts_10m",
]);

export class WeatherRequestError extends Error {
  constructor(message, { code = "weather-error", status = null, cause } = {}) {
    super(message, { cause });
    this.name = "WeatherRequestError";
    this.code = code;
    this.status = status;
  }
}

export function buildForecastUrl({ latitude, longitude }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new TypeError("Valid coordinates are required.");
  const url = new URL(OPEN_METEO_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_VARIABLES.join(","),
    hourly: HOURLY_VARIABLES.join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "7",
  }).toString();
  return url;
}

function nullableNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function addCalendarDays(date, amount) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
}

function hourlyValue(hourly, key, index) {
  return Array.isArray(hourly[key]) ? nullableNumber(hourly[key][index]) : null;
}

export function describeWeatherCode(code) {
  if (code === null || code === undefined) return "Unavailable";
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57, 66, 67].includes(code)) return "Freezing precipitation";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Conditions unavailable";
}

export function normalizeForecast(payload) {
  if (!payload || typeof payload !== "object") throw new WeatherRequestError("The weather provider returned no usable data.", { code: "invalid-data" });
  if (payload.error) throw new WeatherRequestError(payload.reason || "The weather provider rejected the request.", { code: "provider-error" });
  if (!payload.hourly || !Array.isArray(payload.hourly.time) || payload.hourly.time.length === 0) {
    throw new WeatherRequestError("The weather provider returned no hourly forecast.", { code: "invalid-data" });
  }

  const hours = payload.hourly.time.map((time, index) => ({
    time: typeof time === "string" ? time : null,
    localDate: typeof time === "string" ? time.slice(0, 10) : null,
    localTime: typeof time === "string" ? time.slice(11, 16) : null,
    temperature: hourlyValue(payload.hourly, "temperature_2m", index),
    apparentTemperature: hourlyValue(payload.hourly, "apparent_temperature", index),
    precipitationProbability: hourlyValue(payload.hourly, "precipitation_probability", index),
    precipitation: hourlyValue(payload.hourly, "precipitation", index),
    weatherCode: hourlyValue(payload.hourly, "weather_code", index),
    windSpeed: hourlyValue(payload.hourly, "wind_speed_10m", index),
    windGust: hourlyValue(payload.hourly, "wind_gusts_10m", index),
    uvIndex: hourlyValue(payload.hourly, "uv_index", index),
  })).filter(({ time, localDate }) => time && localDate);

  if (!hours.length) throw new WeatherRequestError("The weather provider returned invalid forecast times.", { code: "invalid-data" });
  const firstDate = hours[0].localDate;
  const days = Array.from({ length: 7 }, (_, dayIndex) => {
    const date = addCalendarDays(firstDate, dayIndex);
    const dayHours = hours.filter((hour) => hour.localDate === date);
    const temperatures = dayHours.map(({ temperature }) => temperature).filter(Number.isFinite);
    const representativeCode = dayHours.find(({ weatherCode }) => weatherCode !== null)?.weatherCode ?? null;
    return {
      date,
      hours: dayHours,
      summary: {
        minimumTemperature: temperatures.length ? Math.min(...temperatures) : null,
        maximumTemperature: temperatures.length ? Math.max(...temperatures) : null,
        weatherCode: representativeCode,
        condition: describeWeatherCode(representativeCode),
      },
      complete: dayHours.length === 24,
    };
  });

  const current = payload.current && typeof payload.current === "object" ? {
    time: typeof payload.current.time === "string" ? payload.current.time : null,
    temperature: nullableNumber(payload.current.temperature_2m),
    apparentTemperature: nullableNumber(payload.current.apparent_temperature),
    precipitation: nullableNumber(payload.current.precipitation),
    weatherCode: nullableNumber(payload.current.weather_code),
    windSpeed: nullableNumber(payload.current.wind_speed_10m),
    windGust: nullableNumber(payload.current.wind_gusts_10m),
  } : null;

  return {
    provider: "Open-Meteo",
    latitude: nullableNumber(payload.latitude),
    longitude: nullableNumber(payload.longitude),
    timezone: typeof payload.timezone === "string" ? payload.timezone : null,
    timezoneAbbreviation: typeof payload.timezone_abbreviation === "string" ? payload.timezone_abbreviation : null,
    utcOffsetSeconds: nullableNumber(payload.utc_offset_seconds),
    units: {
      temperature: "°F",
      precipitation: "inch",
      windSpeed: "mph",
      precipitationProbability: "%",
      uvIndex: "index",
    },
    current,
    days,
    quality: {
      expectedHours: 168,
      receivedHours: hours.length,
      missingValues: hours.reduce((count, hour) => count + HOURLY_VARIABLES.filter((key) => {
        const normalizedKeys = {
          temperature_2m: "temperature", apparent_temperature: "apparentTemperature",
          precipitation_probability: "precipitationProbability", precipitation: "precipitation",
          weather_code: "weatherCode", wind_speed_10m: "windSpeed", wind_gusts_10m: "windGust", uv_index: "uvIndex",
        };
        return hour[normalizedKeys[key]] === null;
      }).length, 0),
      partial: hours.length < 168 || days.some(({ complete }) => !complete),
    },
  };
}

export async function fetchForecast(location, { fetchImplementation = fetch, signal } = {}) {
  let response;
  try {
    response = await fetchImplementation(buildForecastUrl(location), { signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new WeatherRequestError("The weather forecast could not be reached. Check your connection and try again.", { code: "network-error", cause: error });
  }

  if (response.status === 429) throw new WeatherRequestError("The weather service is receiving too many requests. Wait a moment and try again.", { code: "rate-limited", status: 429 });
  if (!response.ok) throw new WeatherRequestError("The weather service returned an error. Try again shortly.", { code: "provider-error", status: response.status });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new WeatherRequestError("The weather service returned an unreadable response.", { code: "invalid-data", cause: error });
  }
  return normalizeForecast(payload);
}

export const WEATHER_MODULE_READY = true;
