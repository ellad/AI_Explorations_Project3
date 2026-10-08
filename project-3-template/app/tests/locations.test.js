import test from "node:test";
import assert from "node:assert/strict";

import {
  LOCATION_STORAGE_KEY,
  cityToLocation,
  findCitySuggestions,
  isExactZip,
  loadSavedLocation,
  lookupZip,
  requestDeviceLocation,
  saveLocation,
} from "../scripts/locations.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    entries: () => [...values.entries()],
  };
}

test("city suggestions prioritize prefixes without selecting a result", () => {
  const records = [
    ["East Austin", 30.2, -97.7, "1"],
    ["Austin", 30.3, -97.8, "2"],
    ["Austwell", 28.4, -96.8, "3"],
  ];
  const suggestions = findCitySuggestions(records, "aust");

  assert.deepEqual(suggestions.map(({ name }) => name), ["Austin", "Austwell", "East Austin"]);
  assert.equal(suggestions.every(({ geoid }) => typeof geoid === "string"), true);
});

test("ZIP validation is exact and lookup preserves a leading zero", async () => {
  assert.equal(isExactZip("01001"), true);
  assert.equal(isExactZip("1001"), false);
  assert.equal(isExactZip("01001 extra"), false);

  const location = await lookupZip("01001", async () => ({
    ok: true,
    json: async () => [["01001", 42.0626, -72.6259]],
  }));
  assert.equal(location.name, "01001");
  assert.equal(location.label, "ZIP code 01001");
});

test("ZIP lookup displays its representative Census place when available", async () => {
  const location = await lookupZip("78701", async () => ({
    ok: true,
    json: async () => [["78701", 30.2713, -97.7426, "Austin", "TX"]],
  }));
  assert.equal(location.label, "Austin, TX 78701");
  assert.equal(location.placeName, "Austin");
});

test("city locations include their state and representative coordinates", () => {
  const location = cityToLocation({ name: "Austin", latitude: 30.3, longitude: -97.8, geoid: "4805000" }, "TX");
  assert.equal(location.label, "Austin, TX");
  assert.equal(location.id, "place:4805000");
});

test("only the latest location is stored under the app location key", () => {
  const storage = createStorage();
  const first = { id: "place:1", label: "Austin, TX", latitude: 30.3, longitude: -97.8 };
  const second = { id: "zcta:01001", label: "ZIP code 01001", latitude: 42.1, longitude: -72.6 };

  assert.equal(saveLocation(first, storage), true);
  assert.equal(saveLocation(second, storage), true);
  assert.deepEqual(loadSavedLocation(storage), second);
  assert.deepEqual(storage.entries().map(([key]) => key), [LOCATION_STORAGE_KEY]);
});

test("invalid or unavailable storage does not prevent the current visit", () => {
  const invalidStorage = createStorage({ [LOCATION_STORAGE_KEY]: "not-json" });
  const unavailableStorage = { getItem: () => { throw new Error("blocked"); } };
  assert.equal(loadSavedLocation(invalidStorage), null);
  assert.equal(loadSavedLocation(unavailableStorage), null);
});

test("device location starts only when requested and maps denial to a manual-search recovery", async () => {
  let requests = 0;
  const denied = {
    getCurrentPosition(success, error, options) {
      requests += 1;
      assert.equal(options.timeout, 10_000);
      error({ code: 1 });
    },
  };

  assert.equal(requests, 0);
  await assert.rejects(requestDeviceLocation(denied), /permission was denied.*city or ZIP/i);
  assert.equal(requests, 1);
});

test("device location returns coordinates without reverse-geocoding", async () => {
  const allowed = {
    getCurrentPosition(success) {
      success({ coords: { latitude: 30.2672, longitude: -97.7431 } });
    },
  };
  const location = await requestDeviceLocation(allowed);
  assert.equal(location.label, "Current location");
  assert.equal(location.latitude, 30.2672);
  assert.equal(location.longitude, -97.7431);
});
