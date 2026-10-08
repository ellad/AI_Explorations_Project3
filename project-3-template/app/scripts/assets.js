export const CHARACTER_ASSET = "./assets/longhorn-base-neutral-eyelashes.svg";

export const TOP_ASSETS = Object.freeze({
  "tank-top": "./assets/tank-top.svg",
  "lightweight-tee": "./assets/lightweight-tee.svg",
  "breathable-blouse": "./assets/breathable-blouse.svg",
  polo: "./assets/polo-approved.svg",
  "long-sleeve-tee": "./assets/long-sleeve-tee.svg",
  "button-up": "./assets/button-up.svg",
  "knit-top": "./assets/knit-top.svg",
  sweater: "./assets/sweater.svg",
  turtleneck: "./assets/turtleneck.svg",
  "dressy-blouse": "./assets/dressy-blouse.svg",
  "oxford-shirt": "./assets/oxford-shirt.svg",
  "thermal-top": "./assets/thermal-top.svg",
});

export const BOTTOM_ASSETS = Object.freeze({
  "tailored-shorts": "./assets/tailored-shorts.svg",
  "casual-shorts": "./assets/casual-shorts.svg",
  "lightweight-pants": "./assets/lightweight-pants.svg",
  jeans: "./assets/jeans.svg",
  chinos: "./assets/chinos.svg",
  skirt: "./assets/skirt.svg",
  "dress-pants": "./assets/dress-pants.svg",
  "insulated-pants": "./assets/insulated-pants.svg",
});

export const DRESS_ASSETS = Object.freeze({
  "summer-dress": Object.freeze({ path: "./assets/summer-dress.svg", height: 667.32 }),
  "midi-dress": Object.freeze({ path: "./assets/midi-dress.svg", height: 668.79 }),
  "sweater-dress": Object.freeze({ path: "./assets/sweater-dress.svg", height: 668.79 }),
});

export const OUTERWEAR_ASSETS = Object.freeze({
  "light-cardigan": "./assets/light-cardigan.svg",
  "denim-jacket": "./assets/denim-jacket.svg",
  "rain-jacket": "./assets/rain-jacket.svg",
  windbreaker: "./assets/windbreaker.svg",
  blazer: "./assets/blazer.svg",
  "wool-coat": "./assets/wool-coat.svg",
  "puffer-jacket": "./assets/puffer-jacket-corrected.svg",
  "insulated-parka": "./assets/insulated-parka.svg",
});

export const FOOTWEAR_ASSETS = Object.freeze({
  sandals: "./assets/sandals.svg",
  sneakers: "./assets/sneakers.svg",
  loafers: "./assets/loafers.svg",
  "ankle-boots": "./assets/ankle-boots.svg",
  "water-resistant-boots": "./assets/water-resistant-boots.svg",
  "winter-boots": "./assets/winter-boots.svg",
});

export const ACCESSORY_ASSETS = Object.freeze({
  "sun-hat": "./assets/sun-hat.svg",
  scarf: "./assets/scarf.svg",
  "knit-hat": "./assets/knit-hat.svg",
  gloves: "./assets/gloves.svg",
  umbrella: "./assets/umbrella.svg",
});

export const WEATHER_ICONS = Object.freeze({
  sunny: "./assets/sunny.svg",
  "clear-night": "./assets/clear-night.svg",
  "partly-cloudy": "./assets/partly-cloudy.svg",
  cloudy: "./assets/cloudy.svg",
  foggy: "./assets/foggy.svg",
  rainy: "./assets/rainy.svg",
  snowy: "./assets/snowy.svg",
  thunderstorm: "./assets/thunderstorm.svg",
  windy: "./assets/windy.svg",
});

export const REMINDER_ICONS = Object.freeze({
  "rain-protection": "./assets/rain-protection.svg",
  "wet-footwear": "./assets/wet-weather-footwear.svg",
  hydration: "./assets/hydration.svg",
  "sun-protection": "./assets/sun-protection.svg",
  wind: "./assets/wind-preparation.svg",
  "adaptable-layering": "./assets/adaptable-layering.svg",
});

const ACCESSORY_PLACEMENTS = Object.freeze({
  umbrella: Object.freeze({ x: 51.5, y: 35.21, width: 525, height: 668.79 }),
});

// dress-pants-preview.svg contains the assembled source character on the
// garment artboard. Matching identical torso landmarks between that reference
// and the production base gives this exact translation with no scaling.
export const GARMENT_PLACEMENT = Object.freeze({
  x: 86.5,
  y: 35.21,
  width: 345.78,
  height: 668.79,
});

export function topAssetFor(garmentIds = []) {
  const topId = garmentIds.find((id) => Object.hasOwn(TOP_ASSETS, id));
  return topId ? { id: topId, path: TOP_ASSETS[topId] } : null;
}

export function bottomAssetFor(garmentIds = []) {
  const bottomId = garmentIds.find((id) => Object.hasOwn(BOTTOM_ASSETS, id));
  return bottomId ? { id: bottomId, path: BOTTOM_ASSETS[bottomId] } : null;
}

export function dressAssetFor(garmentIds = []) {
  const dressId = garmentIds.find((id) => Object.hasOwn(DRESS_ASSETS, id));
  return dressId ? { id: dressId, ...DRESS_ASSETS[dressId] } : null;
}

export function outerwearAssetFor(garmentIds = []) {
  const outerwearId = garmentIds.find((id) => Object.hasOwn(OUTERWEAR_ASSETS, id));
  return outerwearId ? { id: outerwearId, path: OUTERWEAR_ASSETS[outerwearId] } : null;
}

export function footwearAssetFor(garmentIds = []) {
  const footwearId = garmentIds.find((id) => Object.hasOwn(FOOTWEAR_ASSETS, id));
  return footwearId ? { id: footwearId, path: FOOTWEAR_ASSETS[footwearId] } : null;
}

export function accessoryAssetsFor(garmentIds = []) {
  return garmentIds
    .filter((id) => Object.hasOwn(ACCESSORY_ASSETS, id))
    .map((id) => ({ id, path: ACCESSORY_ASSETS[id], placement: ACCESSORY_PLACEMENTS[id] ?? GARMENT_PLACEMENT }));
}

export function weatherIconFor({ code, localTime = "12:00", windSpeed = null, windGust = null } = {}) {
  if ((Number.isFinite(windSpeed) && windSpeed >= 25) || (Number.isFinite(windGust) && windGust >= 30)) return WEATHER_ICONS.windy;
  if (code === 0) {
    const hour = Number(localTime?.slice(0, 2));
    return Number.isFinite(hour) && (hour < 6 || hour >= 18) ? WEATHER_ICONS["clear-night"] : WEATHER_ICONS.sunny;
  }
  if ([1, 2].includes(code)) return WEATHER_ICONS["partly-cloudy"];
  if (code === 3) return WEATHER_ICONS.cloudy;
  if ([45, 48].includes(code)) return WEATHER_ICONS.foggy;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return WEATHER_ICONS.rainy;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return WEATHER_ICONS.snowy;
  if ([95, 96, 99].includes(code)) return WEATHER_ICONS.thunderstorm;
  return WEATHER_ICONS.cloudy;
}
