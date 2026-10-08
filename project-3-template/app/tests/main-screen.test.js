import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("main screen contains the complete approved interaction and guidance order", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const requiredIds = [
    "location-form",
    "state",
    "location-query",
    "use-device-location",
    "hourly-strip",
    "outfit-illustration",
    "previous-outfit",
    "next-outfit",
    "style-preferences",
    "occasion-preferences",
    "wear-title",
    "bring-title",
    "notices-title",
  ];
  for (const id of requiredIds) assert.match(html, new RegExp(`id=["']${id}["']`), id);
  assert.match(html, /class="forecast-strip"[^>]*tabindex="0"/);
  assert.match(html, /id="hourly-strip"[^>]*tabindex="0"/);
  assert.ok(html.indexOf('id="wear-title"') < html.indexOf('id="bring-title"'));
  assert.ok(html.indexOf('id="bring-title"') < html.indexOf('id="notices-title"'));
});

test("main screen controller routes each interaction through shared app state", async () => {
  const source = await readFile(new URL("../scripts/app.js", import.meta.url), "utf8");
  assert.match(source, /appState\.selectedDate = date/);
  assert.match(source, /appState\.recommendation = buildRecommendation\(day\)/);
  assert.match(source, /appState\.preferences\[input\.name\] = input\.value/);
  assert.match(source, /appState\.outfitSelection = cycleOutfit/);
  assert.match(source, /renderOutfit\(appState\.outfitSelection/);
});

test("date and hourly rendering expose selection and local-hour behavior", async () => {
  const source = await readFile(new URL("../scripts/render.js", import.meta.url), "utf8");
  assert.match(source, /aria-current", "date/);
  assert.match(source, /findCurrentHourIndex\(day, currentTime\)/);
  assert.match(source, /strip\.scrollLeft = Math\.max/);
});
