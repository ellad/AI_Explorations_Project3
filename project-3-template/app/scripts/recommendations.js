const THUNDER_CODES = new Set([95, 96, 99]);
const FREEZING_PRECIPITATION_CODES = new Set([56, 57, 66, 67]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

export const TEMPERATURE_CATEGORIES = Object.freeze([
  { name: "Hot", minimum: 85, direction: "Lightweight clothing with minimal layers." },
  { name: "Warm", minimum: 75, direction: "Short sleeves and breathable clothing." },
  { name: "Temperate", minimum: 65, direction: "Light clothing with an optional layer." },
  { name: "Cool", minimum: 50, direction: "Long sleeves with a jacket." },
  { name: "Cold", minimum: 32.000001, direction: "Warmer layers with outerwear." },
  { name: "Freezing", minimum: Number.NEGATIVE_INFINITY, direction: "Heavier outerwear with a hat and gloves." },
]);

export function categoryForTemperature(temperature) {
  if (!Number.isFinite(temperature)) return null;
  if (temperature >= 85) return "Hot";
  if (temperature >= 75) return "Warm";
  if (temperature >= 65) return "Temperate";
  if (temperature >= 50) return "Cool";
  if (temperature > 32) return "Cold";
  return "Freezing";
}

export function median(values) {
  const usable = values.filter(Number.isFinite).sort((first, second) => first - second);
  if (!usable.length) return null;
  const middle = Math.floor(usable.length / 2);
  return usable.length % 2 ? usable[middle] : (usable[middle - 1] + usable[middle]) / 2;
}

function hourNumber(hour) {
  return Number.parseInt(hour.localTime?.slice(0, 2), 10);
}

export function recommendationWindow(day) {
  return day.hours.filter((hour) => {
    const value = hourNumber(hour);
    return Number.isInteger(value) && value >= 8 && value <= 20;
  });
}

export function effectiveTemperature(hour) {
  if (Number.isFinite(hour.apparentTemperature)) return hour.apparentTemperature;
  return Number.isFinite(hour.temperature) ? hour.temperature : null;
}

function formatHour(localTime) {
  const hour = Number.parseInt(localTime?.slice(0, 2), 10);
  if (!Number.isInteger(hour)) return "an unavailable time";
  return `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;
}

function consecutiveGroups(hours, predicate) {
  const groups = [];
  let active = [];
  for (const hour of hours) {
    if (predicate(hour)) active.push(hour);
    else if (active.length) {
      groups.push(active);
      active = [];
    }
  }
  if (active.length) groups.push(active);
  return groups;
}

function describeGroups(groups) {
  return groups.map((group) => {
    const first = formatHour(group[0].localTime);
    if (group.length === 1) return `around ${first}`;
    return `${first}–${formatHour(group.at(-1).localTime)}`;
  }).join(" and ");
}

export function timingFor(hours, predicate) {
  const groups = consecutiveGroups(hours, predicate);
  return groups.length ? describeGroups(groups) : "during the day";
}

function includesCode(hour, codes) {
  return Number.isFinite(hour.weatherCode) && codes.has(hour.weatherCode);
}

function hasRainTrigger(hour) {
  return (Number.isFinite(hour.precipitationProbability) && hour.precipitationProbability >= 40)
    || (!Number.isFinite(hour.precipitationProbability) && Number.isFinite(hour.precipitation) && hour.precipitation > 0);
}

function createReminder(type, timing, text, context = {}) {
  return { type, timing, text, context };
}

function createNotice(type, priority, timing, text) {
  return { type, priority, timing, text };
}

export function buildRecommendation(day) {
  const hours = recommendationWindow(day);
  const usableTemperatures = hours.map(effectiveTemperature).filter(Number.isFinite);
  const medianTemperature = median(usableTemperatures);
  const category = categoryForTemperature(medianTemperature);
  const limited = usableTemperatures.length < 7;
  const categoryDefinition = TEMPERATURE_CATEGORIES.find(({ name }) => name === category);

  const hasThunderstorm = hours.some((hour) => includesCode(hour, THUNDER_CODES));
  const hasFreezingPrecipitation = hours.some((hour) => includesCode(hour, FREEZING_PRECIPITATION_CODES));
  const hasSnow = hours.some((hour) => includesCode(hour, SNOW_CODES));
  const hasStrongWind = hours.some((hour) => (Number.isFinite(hour.windSpeed) && hour.windSpeed >= 25)
    || (Number.isFinite(hour.windGust) && hour.windGust >= 30));
  const hasRainProtection = hours.some(hasRainTrigger);
  const precipitationTotal = hours.reduce((total, hour) => total + (Number.isFinite(hour.precipitation) ? hour.precipitation : 0), 0);
  const hasWetFootwear = precipitationTotal >= 0.1 || hasFreezingPrecipitation || hasSnow;
  const hasHydration = hours.some((hour) => {
    const temperature = effectiveTemperature(hour);
    return Number.isFinite(temperature) && temperature >= 80;
  });
  const hasSunProtection = hours.some((hour) => Number.isFinite(hour.uvIndex) && hour.uvIndex >= 3);

  const reminders = [];
  const notices = [];
  const rainTiming = timingFor(hours, hasRainTrigger);
  const windTiming = timingFor(hours, (hour) => (Number.isFinite(hour.windSpeed) && hour.windSpeed >= 25)
    || (Number.isFinite(hour.windGust) && hour.windGust >= 30));

  if (category) {
    const layerGroups = consecutiveGroups(hours, (hour) => {
      const hourCategory = categoryForTemperature(effectiveTemperature(hour));
      return hourCategory !== null && hourCategory !== category;
    }).filter((group) => group.length >= 2);
    if (layerGroups.length) {
      const timing = describeGroups(layerGroups);
      reminders.push(createReminder("adaptable-layering", timing, `Temperatures shift into another clothing range ${timing}. Choose a removable layer.`));
    }
  }

  if (hasRainProtection) {
    const unsafeForUmbrella = hasThunderstorm || hasStrongWind;
    reminders.push(createReminder(
      "rain-protection",
      rainTiming,
      unsafeForUmbrella
        ? `Rain is possible ${rainTiming}. Use broader rain protection and seek suitable shelter instead of relying on an umbrella.`
        : `Rain is possible ${rainTiming}. Bring an umbrella or another rain layer.`,
      { umbrellaUnsafe: unsafeForUmbrella },
    ));
  }
  if (hasWetFootwear) {
    const timing = timingFor(hours, (hour) => (Number.isFinite(hour.precipitation) && hour.precipitation > 0)
      || includesCode(hour, FREEZING_PRECIPITATION_CODES) || includesCode(hour, SNOW_CODES));
    reminders.push(createReminder("wet-footwear", timing, `Wet or wintry surfaces are possible ${timing}. Consider water-resistant, weather-appropriate footwear and use care on slick surfaces.`));
  }
  if (hasHydration) {
    const timing = timingFor(hours, (hour) => effectiveTemperature(hour) >= 80);
    reminders.push(createReminder("hydration", timing, `It may feel hot ${timing}. Consider carrying water, using shade, and taking breaks.`));
  }
  if (hasSunProtection) {
    const timing = timingFor(hours, (hour) => Number.isFinite(hour.uvIndex) && hour.uvIndex >= 3);
    reminders.push(createReminder("sun-protection", timing, `UV reaches 3 or higher ${timing}. Consider sunscreen, shade, sunglasses, or protective clothing.`));
  }
  if (hasStrongWind) {
    reminders.push(createReminder("wind", windTiming, `Strong wind is possible ${windTiming}. Secure loose items and choose a close-fitting or wind-resistant layer.`));
  }

  if (hasThunderstorm) {
    const timing = timingFor(hours, (hour) => includesCode(hour, THUNDER_CODES));
    notices.push(createNotice("thunderstorm", 1, timing, `Forecast thunderstorms ${timing}. This is forecast guidance, not an official alert.`));
  }
  if (hasFreezingPrecipitation) {
    const timing = timingFor(hours, (hour) => includesCode(hour, FREEZING_PRECIPITATION_CODES));
    notices.push(createNotice("freezing-precipitation", 2, timing, `Forecast freezing precipitation ${timing}. This is forecast guidance, not an official alert.`));
  }
  if (hasSnow) {
    const timing = timingFor(hours, (hour) => includesCode(hour, SNOW_CODES));
    notices.push(createNotice("snow", 3, timing, `Forecast snow ${timing}. This is forecast guidance, not an official alert.`));
  }
  if (hasStrongWind) notices.push(createNotice("strong-wind", 4, windTiming, `Forecast strong wind ${windTiming}. This is forecast guidance, not an official alert.`));
  if (hasRainProtection) notices.push(createNotice("rain", 5, rainTiming, `Forecast rain conditions ${rainTiming}. This is forecast guidance, not an official alert.`));

  notices.sort((first, second) => first.priority - second.priority);
  return {
    date: day.date,
    window: { start: "08:00", end: "20:00", hours },
    dataQuality: {
      limited,
      usableTemperatureHours: usableTemperatures.length,
      expectedTemperatureHours: 13,
    },
    temperature: { median: medianTemperature, category },
    wear: {
      category,
      text: categoryDefinition?.direction ?? "There is not enough temperature data for a clothing category.",
    },
    reminders,
    notices,
    conditions: {
      rainProtection: hasRainProtection,
      wetFootwear: hasWetFootwear,
      hydration: hasHydration,
      sunProtection: hasSunProtection,
      strongWind: hasStrongWind,
      thunderstorm: hasThunderstorm,
      freezingPrecipitation: hasFreezingPrecipitation,
      snow: hasSnow,
      precipitationTotal,
    },
  };
}

export const RECOMMENDATIONS_MODULE_READY = true;
