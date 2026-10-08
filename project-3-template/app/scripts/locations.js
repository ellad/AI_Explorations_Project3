export const LOCATION_STORAGE_KEY = "cloud-closet:location";

export const STATES = Object.freeze([
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
]);

const stateNames = new Map(STATES);
const indexCache = new Map();

export function normalizeLocationQuery(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("en-US");
}

export function isExactZip(value) {
  return /^\d{5}$/.test(value.trim());
}

export function findCitySuggestions(records, query, limit = 8) {
  const normalizedQuery = normalizeLocationQuery(query);
  if (normalizedQuery.length < 2) return [];

  return records
    .map(([name, latitude, longitude, geoid]) => ({ name, latitude, longitude, geoid, normalizedName: normalizeLocationQuery(name) }))
    .filter(({ normalizedName }) => normalizedName.includes(normalizedQuery))
    .sort((first, second) => {
      const firstStarts = first.normalizedName.startsWith(normalizedQuery) ? 0 : 1;
      const secondStarts = second.normalizedName.startsWith(normalizedQuery) ? 0 : 1;
      return firstStarts - secondStarts || first.name.localeCompare(second.name) || first.geoid.localeCompare(second.geoid);
    })
    .slice(0, limit)
    .map(({ normalizedName, ...place }) => place);
}

async function loadIndex(fileName, fetchImplementation = fetch) {
  if (!indexCache.has(fileName)) {
    const request = fetchImplementation(new URL(`../data/locations/${fileName}`, import.meta.url))
      .then((response) => {
        if (!response.ok) throw new Error(`Location index request failed with status ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        indexCache.delete(fileName);
        throw error;
      });
    indexCache.set(fileName, request);
  }
  return indexCache.get(fileName);
}

export async function loadStatePlaces(state, fetchImplementation) {
  if (!stateNames.has(state)) throw new Error("Choose a valid state.");
  return loadIndex(`places-${state.toLowerCase()}.json`, fetchImplementation);
}

export async function lookupZip(zip, fetchImplementation) {
  const normalizedZip = zip.trim();
  if (!isExactZip(normalizedZip)) throw new Error("Enter an exact five-digit ZIP code.");
  const records = await loadIndex(`zip-${normalizedZip[0]}.json`, fetchImplementation);
  const match = records.find(([candidate]) => candidate === normalizedZip);
  if (!match) return null;
  const placeName = match[3] ?? null;
  const state = match[4] ?? null;
  return {
    id: `zcta:${match[0]}`,
    type: "zip",
    name: match[0],
    label: placeName && state ? `${placeName}, ${state} ${match[0]}` : `ZIP code ${match[0]}`,
    state,
    placeName,
    latitude: match[1],
    longitude: match[2],
  };
}

export function cityToLocation(place, state) {
  if (!stateNames.has(state)) throw new Error("Choose a valid state.");
  return {
    id: `place:${place.geoid}`,
    type: "city",
    name: place.name,
    label: `${place.name}, ${state}`,
    state,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export function isValidStoredLocation(value) {
  return Boolean(value && typeof value === "object" && typeof value.id === "string" && typeof value.label === "string"
    && Number.isFinite(value.latitude) && Number.isFinite(value.longitude)
    && value.latitude >= -90 && value.latitude <= 90 && value.longitude >= -180 && value.longitude <= 180);
}

export function loadSavedLocation(storage = globalThis.localStorage) {
  try {
    const value = storage.getItem(LOCATION_STORAGE_KEY);
    if (!value) return null;
    const location = JSON.parse(value);
    return isValidStoredLocation(location) ? location : null;
  } catch {
    return null;
  }
}

export function saveLocation(location, storage = globalThis.localStorage) {
  if (!isValidStoredLocation(location)) throw new TypeError("Cannot save an invalid location.");
  try {
    storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    return true;
  } catch {
    return false;
  }
}

export function requestDeviceLocation(geolocation = globalThis.navigator?.geolocation) {
  if (!geolocation) return Promise.reject(new Error("Device location is unavailable in this browser."));
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        id: `device:${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`,
        type: "device",
        name: "Current location",
        label: "Current location",
        state: null,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
      (error) => {
        const messages = {
          1: "Location permission was denied. Search by city or ZIP code instead.",
          2: "Your device location is unavailable. Search by city or ZIP code instead.",
          3: "Finding your location timed out. Try again or search manually.",
        };
        reject(new Error(messages[error.code] ?? "Your location could not be found. Search manually instead."));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  });
}

export function getStateName(state) {
  return stateNames.get(state) ?? "";
}

export const LOCATIONS_MODULE_READY = true;
