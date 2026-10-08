import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import {
  ACCESSORY_ASSETS,
  BOTTOM_ASSETS,
  CHARACTER_ASSET,
  DRESS_ASSETS,
  FOOTWEAR_ASSETS,
  GARMENT_PLACEMENT,
  OUTERWEAR_ASSETS,
  REMINDER_ICONS,
  TOP_ASSETS,
  WEATHER_ICONS,
  accessoryAssetsFor,
  bottomAssetFor,
  dressAssetFor,
  footwearAssetFor,
  outerwearAssetFor,
  topAssetFor,
  weatherIconFor,
} from "../scripts/assets.js";
import { GARMENTS } from "../scripts/outfits.js";

function assetUrl(path) {
  return new URL(`../${path.replace(/^\.\//, "")}`, import.meta.url);
}

test("every catalog top has a source SVG asset", async () => {
  const topIds = GARMENTS.filter(({ slot }) => slot === "top").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(TOP_ASSETS).sort(), topIds);
  await Promise.all([CHARACTER_ASSET, ...Object.values(TOP_ASSETS)].map((path) => access(assetUrl(path))));
});

test("character alignment anchors remain available but are hidden in production", async () => {
  const source = await readFile(assetUrl(CHARACTER_ASSET), "utf8");
  assert.match(source, /<g id="anchors" display="none" aria-hidden="true">/);
  assert.match(source, /id="anchor-neck"/);
  assert.match(source, /id="anchor-foot-right"/);
});

test("every catalog bottom has a source SVG asset", async () => {
  const bottomIds = GARMENTS.filter(({ slot }) => slot === "bottom").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(BOTTOM_ASSETS).sort(), bottomIds);
  await Promise.all(Object.values(BOTTOM_ASSETS).map((path) => access(assetUrl(path))));
});

test("every catalog dress has a source SVG asset", async () => {
  const dressIds = GARMENTS.filter(({ slot }) => slot === "dress").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(DRESS_ASSETS).sort(), dressIds);
  await Promise.all(Object.values(DRESS_ASSETS).map(({ path }) => access(assetUrl(path))));
});

test("every catalog outerwear item has a source SVG asset", async () => {
  const outerwearIds = GARMENTS.filter(({ slot }) => slot === "outerwear").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(OUTERWEAR_ASSETS).sort(), outerwearIds);
  await Promise.all(Object.values(OUTERWEAR_ASSETS).map((path) => access(assetUrl(path))));
});

test("every catalog footwear item has a source SVG asset", async () => {
  const footwearIds = GARMENTS.filter(({ slot }) => slot === "footwear").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(FOOTWEAR_ASSETS).sort(), footwearIds);
  await Promise.all(Object.values(FOOTWEAR_ASSETS).map((path) => access(assetUrl(path))));
});

test("every catalog accessory has a source SVG asset", async () => {
  const accessoryIds = GARMENTS.filter(({ slot }) => slot === "accessory").map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(ACCESSORY_ASSETS).sort(), accessoryIds);
  await Promise.all(Object.values(ACCESSORY_ASSETS).map((path) => access(assetUrl(path))));
});

test("all nine weather icons are available", async () => {
  assert.equal(Object.keys(WEATHER_ICONS).length, 9);
  await Promise.all(Object.values(WEATHER_ICONS).map((path) => access(assetUrl(path))));
});

test("all six reminder types have source SVG icons", async () => {
  assert.deepEqual(Object.keys(REMINDER_ICONS).sort(), [
    "adaptable-layering",
    "hydration",
    "rain-protection",
    "sun-protection",
    "wet-footwear",
    "wind",
  ]);
  await Promise.all(Object.values(REMINDER_ICONS).map((path) => access(assetUrl(path))));
});

test("top assets use the shared artboard and named garment group", async () => {
  for (const [id, path] of Object.entries(TOP_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 345\.78 668\.79["']/);
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("bottom assets use the shared artboard and named garment group", async () => {
  for (const [id, path] of Object.entries(BOTTOM_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 345\.78 668\.79["']/);
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("dress assets use their declared artboard and named garment group", async () => {
  for (const [id, { path, height }] of Object.entries(DRESS_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, new RegExp(`viewBox=["']0 0 345\\.78 ${String(height).replace(".", "\\.")}["']`));
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("outerwear assets use the shared artboard and named garment group", async () => {
  for (const [id, path] of Object.entries(OUTERWEAR_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 345\.78 668\.79["']/);
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("footwear assets use the shared artboard and named garment group", async () => {
  for (const [id, path] of Object.entries(FOOTWEAR_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 345\.78 668\.79["']/);
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("accessory assets use the shared artboard and named garment group", async () => {
  for (const [id, path] of Object.entries(ACCESSORY_ASSETS)) {
    const source = await readFile(assetUrl(path), "utf8");
    if (id === "umbrella") assert.match(source, /viewBox=["']-35 0 525 668\.79["']/);
    else assert.match(source, /viewBox=["']0 0 345\.78 668\.79["']/);
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("weather icons use the shared icon artboard and named weather group", async () => {
  for (const [id, path] of Object.entries(WEATHER_ICONS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 128 128["']/);
    assert.match(source, new RegExp(`id=["']weather-${id}["']`));
  }
});

test("reminder icons use the shared icon artboard and named reminder group", async () => {
  for (const [type, path] of Object.entries(REMINDER_ICONS)) {
    const source = await readFile(assetUrl(path), "utf8");
    assert.match(source, /viewBox=["']0 0 128 128["']/);
    const groupId = type === "wet-footwear" ? "wet-weather-footwear" : type === "wind" ? "wind-preparation" : type;
    assert.match(source, new RegExp(`id=["']reminder-${groupId}["']`));
  }
});

test("weather codes, night hours, and strong wind select the expected icons", () => {
  assert.equal(weatherIconFor({ code: 0, localTime: "12:00" }), WEATHER_ICONS.sunny);
  assert.equal(weatherIconFor({ code: 0, localTime: "22:00" }), WEATHER_ICONS["clear-night"]);
  assert.equal(weatherIconFor({ code: 2 }), WEATHER_ICONS["partly-cloudy"]);
  assert.equal(weatherIconFor({ code: 3 }), WEATHER_ICONS.cloudy);
  assert.equal(weatherIconFor({ code: 45 }), WEATHER_ICONS.foggy);
  assert.equal(weatherIconFor({ code: 61 }), WEATHER_ICONS.rainy);
  assert.equal(weatherIconFor({ code: 71 }), WEATHER_ICONS.snowy);
  assert.equal(weatherIconFor({ code: 95 }), WEATHER_ICONS.thunderstorm);
  assert.equal(weatherIconFor({ code: 0, windGust: 30 }), WEATHER_ICONS.windy);
});

test("garment placement matches the assembled reference without scaling", () => {
  assert.deepEqual(GARMENT_PLACEMENT, {
    x: 86.5,
    y: 35.21,
    width: 345.78,
    height: 668.79,
  });
  // Identical torso landmarks in the preview and production base.
  assert.equal(133.5 + GARMENT_PLACEMENT.x, 220);
  assert.equal(276.79 + GARMENT_PLACEMENT.y, 312);
});

test("asset lookup selects only the top layer from a complete outfit", () => {
  assert.deepEqual(topAssetFor(["jeans", "sweater", "sneakers"]), {
    id: "sweater",
    path: "./assets/sweater.svg",
  });
  assert.equal(topAssetFor(["summer-dress", "sandals"]), null);
  assert.deepEqual(bottomAssetFor(["jeans", "sweater", "sneakers"]), {
    id: "jeans",
    path: "./assets/jeans.svg",
  });
  assert.deepEqual(dressAssetFor(["summer-dress", "sandals"]), {
    id: "summer-dress",
    path: "./assets/summer-dress.svg",
    height: 667.32,
  });
  assert.deepEqual(outerwearAssetFor(["thermal-top", "insulated-parka", "insulated-pants"]), {
    id: "insulated-parka",
    path: "./assets/insulated-parka.svg",
  });
  assert.deepEqual(footwearAssetFor(["jeans", "sweater", "sneakers"]), {
    id: "sneakers",
    path: "./assets/sneakers.svg",
  });
  assert.deepEqual(accessoryAssetsFor(["thermal-top", "knit-hat", "gloves", "winter-boots"]), [
    { id: "knit-hat", path: "./assets/knit-hat.svg", placement: GARMENT_PLACEMENT },
    { id: "gloves", path: "./assets/gloves.svg", placement: GARMENT_PLACEMENT },
  ]);
  assert.deepEqual(accessoryAssetsFor(["umbrella"]), [{
    id: "umbrella",
    path: "./assets/umbrella.svg",
    placement: { x: 51.5, y: 35.21, width: 525, height: 668.79 },
  }]);
});

test("the shell follows the reference body-bottom-top-head layer order", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const baseIndex = html.indexOf('data-layer="base"');
  const weatherPropIndex = html.indexOf('data-layer="weather-prop"');
  const bottomIndex = html.indexOf('data-layer="bottom"');
  const topIndex = html.indexOf('data-layer="top"');
  const dressIndex = html.indexOf('data-layer="dress"');
  const outerwearIndex = html.indexOf('data-layer="outerwear"');
  const footwearIndex = html.indexOf('data-layer="footwear"');
  const neckAccessoryIndex = html.indexOf('data-layer="neck-accessory"');
  const headIndex = html.indexOf('data-layer="head"');
  const accessoryIndex = html.indexOf('data-layer="accessory"');
  assert.match(html, /id="outfit-illustration" role="img" aria-label=/);
  assert.ok(weatherPropIndex >= 0 && weatherPropIndex < baseIndex);
  assert.ok(baseIndex >= 0 && baseIndex < bottomIndex && bottomIndex < topIndex && topIndex < dressIndex && dressIndex < outerwearIndex && outerwearIndex < footwearIndex && footwearIndex < headIndex);
  assert.ok(footwearIndex < neckAccessoryIndex && neckAccessoryIndex < headIndex);
  assert.ok(headIndex < accessoryIndex);
  assert.equal(html.match(/data-layer="accessory"/g)?.length, 2);
  assert.match(html, /data-layer="head" href="\.\/assets\/longhorn-head\.svg"[^>]*width="512" height="348"/);
});

test("the renderer removes the hidden SVG attribute when clothing is available", async () => {
  const source = await readFile(new URL("../scripts/render.js", import.meta.url), "utf8");
  assert.match(source, /layer\.removeAttribute\("hidden"\)/);
  assert.doesNotMatch(source, /Layer\.hidden\s*=\s*false/);
});
