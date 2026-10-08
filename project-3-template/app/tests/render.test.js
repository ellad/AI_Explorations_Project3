import test from "node:test";
import assert from "node:assert/strict";

import { findCurrentHourIndex, shouldShowUmbrella } from "../scripts/render.js";
import { normalizeForecast } from "../scripts/weather.js";
import { successfulForecastFixture } from "./fixtures/weather.js";

test("today starts at the selected location's current local hour", () => {
  const forecast = normalizeForecast(successfulForecastFixture());
  assert.equal(findCurrentHourIndex(forecast.days[0], forecast.current.time), 9);
});

test("future dates begin at midnight rather than inheriting today's hour", () => {
  const forecast = normalizeForecast(successfulForecastFixture());
  assert.equal(findCurrentHourIndex(forecast.days[1], forecast.current.time), -1);
  assert.equal(forecast.days[1].hours[0].localTime, "00:00");
});

test("umbrella art appears for ordinary rain but not strong wind or thunderstorms", () => {
  const ordinaryRain = { conditions: { rainProtection: true, strongWind: false }, notices: [{ type: "rain" }] };
  const strongWind = { conditions: { rainProtection: true, strongWind: true }, notices: [{ type: "strong-wind" }] };
  const thunderstorm = { conditions: { rainProtection: true, strongWind: false }, notices: [{ type: "thunderstorm" }] };
  assert.equal(shouldShowUmbrella(ordinaryRain), true);
  assert.equal(shouldShowUmbrella(strongWind), false);
  assert.equal(shouldShowUmbrella(thunderstorm), false);
});
