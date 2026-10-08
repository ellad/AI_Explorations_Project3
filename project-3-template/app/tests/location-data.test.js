import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";

import {
  convertPlaces,
  convertZctaPlaces,
  convertZctas,
  getPlaceDisplayName,
  isInFiftyStates,
  STATE_NAMES,
} from "../scripts/build-location-data.js";

const dataDirectory = new URL("../data/locations/", import.meta.url);

async function readJson(fileName) {
  return JSON.parse(await readFile(new URL(fileName, dataDirectory), "utf8"));
}

test("place conversion preserves distinct duplicate names and strips Census suffixes", () => {
  const source = [
    "USPS|GEOID|NAME|INTPTLAT|INTPTLONG",
    "TX|4805000|Austin city|30.2676|-97.7430",
    "TX|4805001|Example CDP|31.0000|-98.0000",
    "TX|4805002|Example city|32.0000|-99.0000",
  ].join("\n");
  const places = convertPlaces(source);

  assert.equal(getPlaceDisplayName("Austin city"), "Austin");
  assert.deepEqual(places.TX.filter(([name]) => name === "Example").map((record) => record[3]), ["4805001", "4805002"]);
});

test("ZCTA conversion keeps leading zeroes, shards by first digit, and excludes Puerto Rico", () => {
  const source = [
    "GEOID|INTPTLAT|INTPTLONG",
    "01001|42.0626|-72.6259",
    "99501|61.2181|-149.9003",
    "96813|21.3124|-157.8614",
    "00601|18.1806|-66.7499",
  ].join("\n");
  const zctas = convertZctas(source);

  assert.equal(zctas[0][0][0], "01001");
  assert.equal(zctas[9].some(([zip]) => zip === "99501"), true);
  assert.equal(zctas[9].some(([zip]) => zip === "96813"), true);
  assert.equal(zctas[0].some(([zip]) => zip === "00601"), false);
  assert.equal(isInFiftyStates(18.1806, -66.7499), false);
});

test("ZCTAs use the named Census place with the largest land-area overlap", () => {
  const relationships = [
    "GEOID_ZCTA5_20|GEOID_PLACE_20|NAMELSAD_PLACE_20|AREALAND_PART",
    "78701|4805000|Austin city|3906395",
    "78701|4879000|Smaller Place city|100",
  ].join("\n");
  const zctas = [
    "GEOID|INTPTLAT|INTPTLONG",
    "78701|30.2713|-97.7426",
  ].join("\n");
  const converted = convertZctas(zctas, convertZctaPlaces(relationships));

  assert.deepEqual(converted[7][0], ["78701", 30.2713, -97.7426, "Austin", "TX"]);
});

test("generated files cover every state and ZIP shard", async () => {
  const files = await readdir(dataDirectory);
  for (const state of Object.keys(STATE_NAMES)) {
    assert.ok(files.includes(`places-${state.toLowerCase()}.json`), `missing ${state}`);
  }
  for (let digit = 0; digit <= 9; digit += 1) {
    const shard = await readJson(`zip-${digit}.json`);
    assert.ok(shard.length > 0, `zip-${digit}.json is empty`);
    assert.ok(shard.every(([zip]) => typeof zip === "string" && zip.startsWith(String(digit))));
  }
});

test("generated data includes representative states and excludes a special-purpose ZIP", async () => {
  const [texas, alaska, hawaii, zipZero, zipNine, zipTwo] = await Promise.all([
    readJson("places-tx.json"),
    readJson("places-ak.json"),
    readJson("places-hi.json"),
    readJson("zip-0.json"),
    readJson("zip-9.json"),
    readJson("zip-2.json"),
  ]);

  assert.ok(texas.some(([name]) => name === "Austin"));
  assert.ok(alaska.some(([name]) => name === "Anchorage"));
  assert.ok(hawaii.some(([name]) => name === "Urban Honolulu"));
  assert.ok(zipZero.some(([zip]) => zip.startsWith("0") && zip.length === 5));
  assert.ok(zipNine.some(([zip]) => zip === "99501"));
  assert.ok(zipNine.some(([zip]) => zip === "96813"));
  assert.equal(zipTwo.some(([zip]) => zip === "20500"), false);
});

test("generated runtime location data remains reasonably compact", async () => {
  const files = (await readdir(dataDirectory)).filter((name) => name.endsWith(".json"));
  const sizes = await Promise.all(files.map(async (name) => (await stat(new URL(name, dataDirectory))).size));
  const totalBytes = sizes.reduce((sum, size) => sum + size, 0);

  assert.ok(totalBytes < 3_000_000, `location data is ${totalBytes} bytes`);
  assert.ok(Math.max(...sizes) < 500_000, "an individual lazy-loaded file exceeds 500 KB");
});
