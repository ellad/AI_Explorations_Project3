import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const cacheDirectory = join(appRoot, ".cache", "census");
const outputDirectory = join(appRoot, "data", "locations");

export const CENSUS_RELEASE = "2026";
export const SOURCE_URLS = Object.freeze({
  places: "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_place_national.zip",
  zctas: "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_zcta_national.zip",
  zctaPlaces: "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_place20_natl.txt",
});
export const SOURCE_SHA256 = Object.freeze({
  places: "af678e2d990827c89ee39b98c82de6e90b693c7361ff0e559ae3076670dd2863",
  zctas: "f1e9046b91f6e60686a99343cb2752834c02b0764939403b331c78c017e2c54c",
  zctaPlaces: "698a5dad71ed419411677d0ffd8ecd9331067f59c472cdd239b92c12f698285d",
});

export const STATE_NAMES = Object.freeze({
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii",
  ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
});

const FIPS_TO_STATE = Object.freeze({
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
});

const PLACE_SUFFIXES = [
  " consolidated government (balance)",
  " unified government (balance)",
  " metropolitan government (balance)",
  " metropolitan government",
  " consolidated government",
  " urban county",
  " municipality",
  " city and borough",
  " city and county",
  " census designated place",
  " borough",
  " village",
  " town",
  " city",
  " CDP",
];

export function parseDelimited(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.replace(/^\uFEFF/, "").split("|").map((value) => value.trim());

  return lines.filter(Boolean).map((line) => {
    const values = line.split("|").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

export function getPlaceDisplayName(officialName) {
  const suffix = PLACE_SUFFIXES.find((candidate) => officialName.endsWith(candidate));
  return suffix ? officialName.slice(0, -suffix.length) : officialName;
}

export function isInFiftyStates(latitude, longitude) {
  const contiguous = latitude >= 24 && latitude <= 50 && longitude >= -125 && longitude <= -66;
  const alaskaLongitude = (longitude >= -180 && longitude <= -129) || (longitude >= 170 && longitude <= 180);
  const alaska = latitude >= 51 && latitude <= 72 && alaskaLongitude;
  const hawaii = latitude >= 18 && latitude <= 23 && longitude >= -161 && longitude <= -154;
  return contiguous || alaska || hawaii;
}

export function convertPlaces(text) {
  const states = Object.fromEntries(Object.keys(STATE_NAMES).map((code) => [code, []]));

  for (const row of parseDelimited(text)) {
    if (!states[row.USPS]) continue;
    states[row.USPS].push([
      getPlaceDisplayName(row.NAME),
      Number(row.INTPTLAT),
      Number(row.INTPTLONG),
      row.GEOID,
    ]);
  }

  for (const places of Object.values(states)) {
    places.sort((first, second) => first[0].localeCompare(second[0]) || first[3].localeCompare(second[3]));
  }

  return states;
}

export function convertZctaPlaces(text) {
  const relationships = new Map();
  for (const row of parseDelimited(text)) {
    const zip = row.GEOID_ZCTA5_20;
    const placeGeoid = row.GEOID_PLACE_20;
    const state = FIPS_TO_STATE[placeGeoid?.slice(0, 2)];
    if (!/^\d{5}$/.test(zip) || !placeGeoid || !state || !row.NAMELSAD_PLACE_20) continue;

    const landArea = Number(row.AREALAND_PART) || 0;
    const existing = relationships.get(zip);
    if (!existing || landArea > existing.landArea) {
      relationships.set(zip, {
        name: getPlaceDisplayName(row.NAMELSAD_PLACE_20),
        state,
        landArea,
      });
    }
  }
  return relationships;
}

export function convertZctas(text, placeRelationships = new Map()) {
  const shards = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [String(index), []]));

  for (const row of parseDelimited(text)) {
    const latitude = Number(row.INTPTLAT);
    const longitude = Number(row.INTPTLONG);
    if (!/^\d{5}$/.test(row.GEOID) || !isInFiftyStates(latitude, longitude)) continue;
    const place = placeRelationships.get(row.GEOID);
    const record = [row.GEOID, latitude, longitude];
    if (place) record.push(place.name, place.state);
    shards[row.GEOID[0]].push(record);
  }

  for (const zctas of Object.values(shards)) {
    zctas.sort((first, second) => first[0].localeCompare(second[0]));
  }

  return shards;
}

async function download(url, expectedChecksum) {
  const destination = join(cacheDirectory, basename(url));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Census download failed (${response.status}): ${url}`);
  const contents = Buffer.from(await response.arrayBuffer());
  const actualChecksum = createHash("sha256").update(contents).digest("hex");
  if (actualChecksum !== expectedChecksum) {
    throw new Error(`Census archive checksum changed for ${url}. Review the source before rebuilding.`);
  }
  await writeFile(destination, contents);
  return destination;
}

async function extractArchive(archivePath) {
  const { stdout } = await execFileAsync("unzip", ["-p", archivePath], {
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024,
  });
  return stdout;
}

async function checksum(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

async function writeJson(fileName, value) {
  await writeFile(join(outputDirectory, fileName), `${JSON.stringify(value)}\n`);
}

export async function buildLocationData() {
  await mkdir(cacheDirectory, { recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  const placesArchive = await download(SOURCE_URLS.places, SOURCE_SHA256.places);
  const zctasArchive = await download(SOURCE_URLS.zctas, SOURCE_SHA256.zctas);
  const zctaPlacesFile = await download(SOURCE_URLS.zctaPlaces, SOURCE_SHA256.zctaPlaces);
  const [placesText, zctasText, zctaPlacesText] = await Promise.all([
    extractArchive(placesArchive),
    extractArchive(zctasArchive),
    readFile(zctaPlacesFile, "utf8"),
  ]);
  const places = convertPlaces(placesText);
  const zctas = convertZctas(zctasText, convertZctaPlaces(zctaPlacesText));

  await Promise.all([
    ...Object.entries(places).map(([state, records]) => writeJson(`places-${state.toLowerCase()}.json`, records)),
    ...Object.entries(zctas).map(([digit, records]) => writeJson(`zip-${digit}.json`, records)),
  ]);

  const metadata = {
    release: CENSUS_RELEASE,
    sourcePublished: "2026-09-08",
    coverage: "50 US states and the District of Columbia; ZCTAs use representative internal points",
    format: {
      places: "[displayName, latitude, longitude, Census GEOID]",
      zctas: "[fiveDigitZcta, latitude, longitude, representativePlace?, state?]",
    },
    sources: {
      places: { url: SOURCE_URLS.places, sha256: await checksum(placesArchive) },
      zctas: { url: SOURCE_URLS.zctas, sha256: await checksum(zctasArchive) },
      zctaPlaces: { url: SOURCE_URLS.zctaPlaces, sha256: await checksum(zctaPlacesFile) },
    },
    counts: {
      places: Object.values(places).reduce((sum, records) => sum + records.length, 0),
      zctas: Object.values(zctas).reduce((sum, records) => sum + records.length, 0),
    },
  };
  await writeJson("metadata.json", metadata);
  return metadata;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const metadata = await buildLocationData();
  console.log(`Generated ${metadata.counts.places} places and ${metadata.counts.zctas} ZCTAs from the ${metadata.release} Census Gazetteer.`);
}
