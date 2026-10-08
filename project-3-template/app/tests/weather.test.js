import test from "node:test";
import assert from "node:assert/strict";

import {
  CURRENT_VARIABLES,
  HOURLY_VARIABLES,
  WeatherRequestError,
  buildForecastUrl,
  fetchForecast,
  normalizeForecast,
} from "../scripts/weather.js";
import {
  jsonResponse,
  nullForecastFixture,
  partialForecastFixture,
  providerErrorFixture,
  successfulForecastFixture,
} from "./fixtures/weather.js";

test("forecast URL requests seven local days in US customary units", () => {
  const url = buildForecastUrl({ latitude: 30.2672, longitude: -97.7431 });
  assert.equal(url.origin + url.pathname, "https://api.open-meteo.com/v1/forecast");
  assert.equal(url.searchParams.get("latitude"), "30.2672");
  assert.equal(url.searchParams.get("longitude"), "-97.7431");
  assert.equal(url.searchParams.get("temperature_unit"), "fahrenheit");
  assert.equal(url.searchParams.get("wind_speed_unit"), "mph");
  assert.equal(url.searchParams.get("precipitation_unit"), "inch");
  assert.equal(url.searchParams.get("timezone"), "auto");
  assert.equal(url.searchParams.get("forecast_days"), "7");
  assert.deepEqual(url.searchParams.get("current").split(","), [...CURRENT_VARIABLES]);
  assert.deepEqual(url.searchParams.get("hourly").split(","), [...HOURLY_VARIABLES]);
});

test("successful responses normalize to exactly seven selected-location dates", () => {
  const forecast = normalizeForecast(successfulForecastFixture());
  assert.equal(forecast.timezone, "America/Chicago");
  assert.equal(forecast.days.length, 7);
  assert.equal(forecast.days[0].date, "2026-10-05");
  assert.equal(forecast.days[6].date, "2026-10-11");
  assert.equal(forecast.days.every(({ hours }) => hours.length === 24), true);
  assert.equal(forecast.quality.partial, false);
  assert.equal(forecast.current.temperature, 78);
  assert.equal(forecast.units.windSpeed, "mph");
});

test("null values remain unavailable rather than becoming zero", () => {
  const forecast = normalizeForecast(nullForecastFixture());
  assert.equal(forecast.days[0].hours[9].apparentTemperature, null);
  assert.equal(forecast.days[0].hours[12].precipitationProbability, null);
  assert.equal(forecast.days[0].hours[14].uvIndex, null);
  assert.equal(forecast.current.temperature, null);
  assert.ok(forecast.quality.missingValues >= 3);
});

test("partial responses retain seven dates and mark absent hours", () => {
  const forecast = normalizeForecast(partialForecastFixture());
  assert.equal(forecast.days.length, 7);
  assert.equal(forecast.days[0].hours.length, 24);
  assert.equal(forecast.days[1].hours.length, 6);
  assert.equal(forecast.days[2].hours.length, 0);
  assert.equal(forecast.days[2].summary.maximumTemperature, null);
  assert.equal(forecast.quality.partial, true);
});

test("a delayed response remains pending and then normalizes", async () => {
  let release;
  const delayed = new Promise((resolve) => { release = resolve; });
  let settled = false;
  const request = fetchForecast({ latitude: 30, longitude: -97 }, { fetchImplementation: () => delayed }).then((value) => {
    settled = true;
    return value;
  });
  await Promise.resolve();
  assert.equal(settled, false);
  release(jsonResponse(successfulForecastFixture()));
  assert.equal((await request).days.length, 7);
});

test("rejected requests become recoverable network errors", async () => {
  await assert.rejects(
    fetchForecast({ latitude: 30, longitude: -97 }, { fetchImplementation: async () => { throw new Error("offline"); } }),
    (error) => error instanceof WeatherRequestError && error.code === "network-error" && /try again/i.test(error.message),
  );
});

test("provider error payloads retain the provider reason", async () => {
  await assert.rejects(
    fetchForecast({ latitude: 100, longitude: -97 }, { fetchImplementation: async () => jsonResponse(providerErrorFixture) }),
    (error) => error.code === "provider-error" && /Latitude/.test(error.message),
  );
});

test("rate limiting has a distinct retry-later error", async () => {
  await assert.rejects(
    fetchForecast({ latitude: 30, longitude: -97 }, { fetchImplementation: async () => jsonResponse({}, { ok: false, status: 429 }) }),
    (error) => error.code === "rate-limited" && error.status === 429,
  );
});

test("other provider HTTP failures have a recoverable provider error", async () => {
  await assert.rejects(
    fetchForecast({ latitude: 30, longitude: -97 }, { fetchImplementation: async () => jsonResponse({}, { ok: false, status: 503 }) }),
    (error) => error.code === "provider-error" && error.status === 503,
  );
});
