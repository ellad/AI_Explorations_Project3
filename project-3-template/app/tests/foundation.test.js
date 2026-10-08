import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { ROUTES, routeFromHash } from "../scripts/router.js";
import { createInitialState, DEFAULT_PREFERENCES } from "../scripts/state.js";
import {
  LOCATIONS_MODULE_READY,
} from "../scripts/locations.js";
import {
  RECOMMENDATIONS_MODULE_READY,
} from "../scripts/recommendations.js";
import { RENDER_MODULE_READY } from "../scripts/render.js";
import { VARIATIONS_MODULE_READY } from "../scripts/variations.js";
import { WEATHER_MODULE_READY } from "../scripts/weather.js";

test("hash routing supports direct links to both screens", () => {
  assert.equal(routeFromHash(ROUTES.home), "home");
  assert.equal(routeFromHash(ROUTES.about), "about");
  assert.equal(routeFromHash("#/unknown"), "home");
});

test("a new visit starts without a location and with approved defaults", () => {
  const state = createInitialState();

  assert.equal(state.location, null);
  assert.equal(state.forecast, null);
  assert.equal(state.status, "awaiting-location");
  assert.deepEqual(state.preferences, DEFAULT_PREFERENCES);
  assert.notEqual(state.preferences, DEFAULT_PREFERENCES);
});

test("planned feature module boundaries are available", () => {
  assert.equal(LOCATIONS_MODULE_READY, true);
  assert.equal(RECOMMENDATIONS_MODULE_READY, true);
  assert.equal(RENDER_MODULE_READY, true);
  assert.equal(VARIATIONS_MODULE_READY, true);
  assert.equal(WEATHER_MODULE_READY, true);
});

test("the shell contains both semantic screens in the approved guidance order", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const wearIndex = html.indexOf('id="wear-title"');
  const bringIndex = html.indexOf('id="bring-title"');
  const noticesIndex = html.indexOf('id="notices-title"');

  assert.match(html, /<main id="main-content"/);
  assert.match(html, /data-route="home"/);
  assert.match(html, /data-route="about"/);
  assert.match(html, /aria-label="About Cloud Closet"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /role="listbox"/);
  assert.match(html, />Use my location</);
  assert.match(html, /id="hourly-strip"/);
  assert.ok(wearIndex < bringIndex && bringIndex < noticesIndex);
});
