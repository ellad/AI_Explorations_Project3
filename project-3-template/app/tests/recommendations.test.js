import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRecommendation,
  categoryForTemperature,
  median,
  recommendationWindow,
} from "../scripts/recommendations.js";

function makeHour(hour, overrides = {}) {
  return {
    time: `2026-10-05T${String(hour).padStart(2, "0")}:00`,
    localDate: "2026-10-05",
    localTime: `${String(hour).padStart(2, "0")}:00`,
    temperature: 70,
    apparentTemperature: 70,
    precipitationProbability: 0,
    precipitation: 0,
    weatherCode: 0,
    windSpeed: 0,
    windGust: 0,
    uvIndex: 0,
    ...overrides,
  };
}

function makeDay(mutator = () => {}) {
  const hours = Array.from({ length: 24 }, (_, hour) => makeHour(hour));
  mutator(hours);
  return { date: "2026-10-05", hours };
}

function setWindow(hours, overrides) {
  for (let hour = 8; hour <= 20; hour += 1) Object.assign(hours[hour], overrides);
}

test("recommendation window includes all 13 local hours from 8 AM through 8 PM", () => {
  const hours = recommendationWindow(makeDay());
  assert.equal(hours.length, 13);
  assert.equal(hours[0].localTime, "08:00");
  assert.equal(hours.at(-1).localTime, "20:00");
});

test("median handles odd, even, missing, and empty inputs", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([null, 3, undefined]), 3);
  assert.equal(median([null, undefined]), null);
});

test("temperature category boundaries use the approved inclusive ranges", () => {
  const cases = [
    [85, "Hot"], [84.9, "Warm"],
    [75, "Warm"], [74.9, "Temperate"],
    [65, "Temperate"], [64.9, "Cool"],
    [50, "Cool"], [49.9, "Cold"],
    [32.1, "Cold"], [32, "Freezing"], [31.9, "Freezing"],
  ];
  for (const [temperature, expected] of cases) assert.equal(categoryForTemperature(temperature), expected, `${temperature}°F`);
});

test("apparent temperature falls back to air temperature without treating missing values as zero", () => {
  const recommendation = buildRecommendation(makeDay((hours) => {
    setWindow(hours, { apparentTemperature: null, temperature: 66 });
    hours[8].temperature = null;
  }));
  assert.equal(recommendation.temperature.median, 66);
  assert.equal(recommendation.dataQuality.usableTemperatureHours, 12);
});

test("limited forecast data begins below seven usable temperature hours", () => {
  const six = buildRecommendation(makeDay((hours) => {
    setWindow(hours, { apparentTemperature: null, temperature: null });
    for (let hour = 8; hour < 14; hour += 1) hours[hour].temperature = 60;
  }));
  const seven = buildRecommendation(makeDay((hours) => {
    setWindow(hours, { apparentTemperature: null, temperature: null });
    for (let hour = 8; hour < 15; hour += 1) hours[hour].temperature = 60;
  }));
  assert.equal(six.dataQuality.limited, true);
  assert.equal(seven.dataQuality.limited, false);
});

test("two consecutive hours in another category add timed removable-layer guidance", () => {
  const recommendation = buildRecommendation(makeDay((hours) => {
    hours[8].apparentTemperature = 60;
    hours[9].apparentTemperature = 60;
  }));
  const layering = recommendation.reminders.find(({ type }) => type === "adaptable-layering");
  assert.match(layering.text, /8 AM–9 AM/);
});

test("one isolated hour in another category does not add layering guidance", () => {
  const recommendation = buildRecommendation(makeDay((hours) => { hours[8].apparentTemperature = 60; }));
  assert.equal(recommendation.reminders.some(({ type }) => type === "adaptable-layering"), false);
});

for (const [probability, expected] of [[39.9, false], [40, true], [40.1, true]]) {
  test(`rain protection at ${probability}% is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].precipitationProbability = probability; }));
    assert.equal(result.conditions.rainProtection, expected);
  });
}

test("measurable precipitation triggers rain guidance only when probability is unavailable", () => {
  const unavailable = buildRecommendation(makeDay((hours) => Object.assign(hours[12], { precipitationProbability: null, precipitation: 0.01 })));
  const knownLow = buildRecommendation(makeDay((hours) => Object.assign(hours[12], { precipitationProbability: 10, precipitation: 0.01 })));
  assert.equal(unavailable.conditions.rainProtection, true);
  assert.equal(knownLow.conditions.rainProtection, false);
});

for (const [total, expected] of [[0.09, false], [0.1, true], [0.11, true]]) {
  test(`wet-weather footwear at ${total} inches is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].precipitation = total; }));
    assert.equal(result.conditions.wetFootwear, expected);
  });
}

test("snow or freezing precipitation triggers weather-appropriate footwear", () => {
  const snow = buildRecommendation(makeDay((hours) => { hours[12].weatherCode = 71; }));
  const freezing = buildRecommendation(makeDay((hours) => { hours[12].weatherCode = 66; }));
  assert.equal(snow.conditions.wetFootwear, true);
  assert.equal(freezing.conditions.wetFootwear, true);
});

for (const [temperature, expected] of [[79.9, false], [80, true], [80.1, true]]) {
  test(`hydration at ${temperature}°F is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].apparentTemperature = temperature; }));
    assert.equal(result.conditions.hydration, expected);
  });
}

for (const [uvIndex, expected] of [[2.9, false], [3, true], [3.1, true]]) {
  test(`sun protection at UV ${uvIndex} is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].uvIndex = uvIndex; }));
    assert.equal(result.conditions.sunProtection, expected);
  });
}

for (const [windSpeed, expected] of [[24.9, false], [25, true], [25.1, true]]) {
  test(`wind preparation at ${windSpeed} mph sustained is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].windSpeed = windSpeed; }));
    assert.equal(result.conditions.strongWind, expected);
  });
}

for (const [windGust, expected] of [[29.9, false], [30, true], [30.1, true]]) {
  test(`wind preparation at ${windGust} mph gusts is ${expected ? "triggered" : "suppressed"}`, () => {
    const result = buildRecommendation(makeDay((hours) => { hours[12].windGust = windGust; }));
    assert.equal(result.conditions.strongWind, expected);
  });
}

test("thunderstorm or strong wind suppresses ordinary umbrella wording", () => {
  const thunderstorm = buildRecommendation(makeDay((hours) => Object.assign(hours[12], { precipitationProbability: 60, weatherCode: 95 })));
  const wind = buildRecommendation(makeDay((hours) => Object.assign(hours[12], { precipitationProbability: 60, windGust: 30 })));
  for (const result of [thunderstorm, wind]) {
    const reminder = result.reminders.find(({ type }) => type === "rain-protection");
    assert.doesNotMatch(reminder.text, /bring an umbrella/i);
    assert.match(reminder.text, /shelter/i);
  }
});

test("overlapping notices are retained in priority order and avoid official-alert language", () => {
  const result = buildRecommendation(makeDay((hours) => {
    Object.assign(hours[12], { precipitationProbability: 60, weatherCode: 95, windGust: 30 });
    hours[13].weatherCode = 66;
    hours[14].weatherCode = 71;
  }));
  assert.deepEqual(result.notices.map(({ type }) => type), ["thunderstorm", "freezing-precipitation", "snow", "strong-wind", "rain"]);
  assert.equal(result.notices.every(({ text }) => !/watch|warning|advisory/i.test(text)), true);
});
