function localHour(startDate, index) {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCHours(date.getUTCHours() + index);
  return date.toISOString().slice(0, 16);
}

export function successfulForecastFixture({ startDate = "2026-10-05", hours = 168, timezone = "America/Chicago" } = {}) {
  const time = Array.from({ length: hours }, (_, index) => localHour(startDate, index));
  const values = (createValue) => time.map((_, index) => createValue(index));
  return {
    latitude: 30.25,
    longitude: -97.75,
    utc_offset_seconds: -18000,
    timezone,
    timezone_abbreviation: "CDT",
    current: {
      time: `${startDate}T09:15`,
      temperature_2m: 78,
      apparent_temperature: 80,
      precipitation: 0,
      weather_code: 1,
      wind_speed_10m: 8,
      wind_gusts_10m: 14,
    },
    hourly_units: {
      temperature_2m: "°F",
      apparent_temperature: "°F",
      precipitation_probability: "%",
      precipitation: "inch",
      weather_code: "wmo code",
      wind_speed_10m: "mph",
      wind_gusts_10m: "mph",
      uv_index: "",
    },
    hourly: {
      time,
      temperature_2m: values((index) => 65 + (index % 12)),
      apparent_temperature: values((index) => 66 + (index % 12)),
      precipitation_probability: values(() => 10),
      precipitation: values(() => 0),
      weather_code: values(() => 1),
      wind_speed_10m: values(() => 8),
      wind_gusts_10m: values(() => 14),
      uv_index: values((index) => index % 24 === 13 ? 5 : 0),
    },
  };
}

export function nullForecastFixture() {
  const fixture = successfulForecastFixture();
  fixture.hourly.apparent_temperature[9] = null;
  fixture.hourly.precipitation_probability[12] = null;
  fixture.hourly.uv_index[14] = null;
  fixture.current.temperature_2m = null;
  return fixture;
}

export function partialForecastFixture() {
  return successfulForecastFixture({ hours: 30 });
}

export const providerErrorFixture = {
  error: true,
  reason: "Latitude must be in range of -90 to 90°.",
};

export function jsonResponse(payload, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => payload };
}
