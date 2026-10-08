export const CATEGORIES = Object.freeze(["Hot", "Warm", "Temperate", "Cool", "Cold", "Freezing"]);
export const OCCASIONS = Object.freeze(["everyday", "game-day", "birthday-party"]);
export const STYLES = Object.freeze(["masculine", "feminine"]);

const ALL_CATEGORIES = CATEGORIES;
const ALL_OCCASIONS = OCCASIONS;
const BOTH_STYLES = STYLES;

function garment(id, label, slot, { categories = ALL_CATEGORIES, occasions = ALL_OCCASIONS, styles = BOTH_STYLES, layer = 0 } = {}) {
  return { id, label, slot, categories, occasions, styles, layer };
}

export const GARMENTS = Object.freeze([
  garment("tank-top", "tank top", "top", { categories: ["Hot", "Warm"], styles: ["feminine"] }),
  garment("lightweight-tee", "lightweight T-shirt", "top", { categories: ["Hot", "Warm", "Temperate"] }),
  garment("breathable-blouse", "breathable blouse", "top", { categories: ["Hot", "Warm", "Temperate"], styles: ["feminine"] }),
  garment("polo", "polo shirt", "top", { categories: ["Hot", "Warm", "Temperate"], styles: ["masculine"] }),
  garment("long-sleeve-tee", "long-sleeve T-shirt", "top", { categories: ["Temperate", "Cool", "Cold"] }),
  garment("button-up", "button-up shirt", "top", { categories: ["Warm", "Temperate", "Cool"], styles: ["masculine"] }),
  garment("knit-top", "knit top", "top", { categories: ["Temperate", "Cool", "Cold"], styles: ["feminine"] }),
  garment("sweater", "sweater", "top", { categories: ["Cool", "Cold", "Freezing"], layer: 1 }),
  garment("turtleneck", "turtleneck", "top", { categories: ["Cold", "Freezing"], styles: ["feminine"], layer: 1 }),
  garment("dressy-blouse", "dressy blouse", "top", { categories: ["Hot", "Warm", "Temperate", "Cool", "Cold"], occasions: ["birthday-party"], styles: ["feminine"] }),
  garment("oxford-shirt", "Oxford shirt", "top", { categories: ["Warm", "Temperate", "Cool", "Cold"], occasions: ["birthday-party"], styles: ["masculine"] }),
  garment("thermal-top", "thermal top", "top", { categories: ["Cold", "Freezing"], layer: 0 }),

  garment("tailored-shorts", "tailored shorts", "bottom", { categories: ["Hot", "Warm"] }),
  garment("casual-shorts", "casual shorts", "bottom", { categories: ["Hot", "Warm"] }),
  garment("lightweight-pants", "lightweight pants", "bottom", { categories: ["Hot", "Warm", "Temperate"] }),
  garment("jeans", "jeans", "bottom", { categories: ["Temperate", "Cool", "Cold"] }),
  garment("chinos", "chinos", "bottom", { categories: ["Warm", "Temperate", "Cool", "Cold"], styles: ["masculine"] }),
  garment("skirt", "midi skirt", "bottom", { categories: ["Hot", "Warm", "Temperate", "Cool"], styles: ["feminine"] }),
  garment("dress-pants", "dress pants", "bottom", { categories: ["Warm", "Temperate", "Cool", "Cold"], occasions: ["birthday-party"], styles: ["masculine"] }),
  garment("insulated-pants", "insulated pants", "bottom", { categories: ["Freezing"] }),

  garment("summer-dress", "summer dress", "dress", { categories: ["Hot", "Warm"], occasions: ["birthday-party"], styles: ["feminine"] }),
  garment("midi-dress", "midi dress", "dress", { categories: ["Temperate", "Cool"], occasions: ["birthday-party"], styles: ["feminine"] }),
  garment("sweater-dress", "sweater dress", "dress", { categories: ["Cold", "Freezing"], occasions: ["birthday-party"], styles: ["feminine"] }),

  garment("light-cardigan", "light cardigan", "outerwear", { categories: ["Temperate", "Cool"], layer: 2 }),
  garment("denim-jacket", "denim jacket", "outerwear", { categories: ["Temperate", "Cool"], layer: 2 }),
  garment("rain-jacket", "light rain jacket", "outerwear", { categories: ["Warm", "Temperate", "Cool"], layer: 3 }),
  garment("windbreaker", "windbreaker", "outerwear", { categories: ["Temperate", "Cool", "Cold"], layer: 3 }),
  garment("blazer", "blazer", "outerwear", { categories: ["Temperate", "Cool", "Cold"], occasions: ["birthday-party"], layer: 2 }),
  garment("wool-coat", "wool coat", "outerwear", { categories: ["Cold", "Freezing"], layer: 3 }),
  garment("puffer-jacket", "puffer jacket", "outerwear", { categories: ["Cold", "Freezing"], layer: 3 }),
  garment("insulated-parka", "insulated parka", "outerwear", { categories: ["Freezing"], layer: 4 }),

  garment("sandals", "sandals", "footwear", { categories: ["Hot", "Warm"] }),
  garment("sneakers", "sneakers", "footwear", { categories: ["Hot", "Warm", "Temperate", "Cool"] }),
  garment("loafers", "loafers", "footwear", { categories: ["Hot", "Warm", "Temperate", "Cool", "Cold"] }),
  garment("ankle-boots", "ankle boots", "footwear", { categories: ["Temperate", "Cool", "Cold"], styles: ["feminine"] }),
  garment("water-resistant-boots", "water-resistant boots", "footwear", { categories: ["Cool", "Cold", "Freezing"] }),
  garment("winter-boots", "winter boots", "footwear", { categories: ["Freezing"] }),

  garment("sun-hat", "sun hat", "accessory", { categories: ["Hot", "Warm"] }),
  garment("scarf", "scarf", "accessory", { categories: ["Cold", "Freezing"] }),
  garment("knit-hat", "knit hat", "accessory", { categories: ["Cold", "Freezing"] }),
  garment("gloves", "gloves", "accessory", { categories: ["Freezing"] }),
  garment("umbrella", "umbrella", "accessory", { categories: ALL_CATEGORIES }),
]);

export const GARMENT_BY_ID = new Map(GARMENTS.map((item) => [item.id, item]));

const everyday = {
  Hot: {
    masculine: [["lightweight-tee", "casual-shorts", "sneakers"], ["polo", "tailored-shorts", "loafers"], ["lightweight-tee", "lightweight-pants", "sandals"]],
    feminine: [["tank-top", "casual-shorts", "sandals"], ["breathable-blouse", "tailored-shorts", "sneakers"], ["tank-top", "lightweight-pants", "sneakers"]],
  },
  Warm: {
    masculine: [["lightweight-tee", "casual-shorts", "sneakers"], ["polo", "chinos", "loafers"], ["button-up", "tailored-shorts", "sneakers"]],
    feminine: [["breathable-blouse", "skirt", "sandals"], ["lightweight-tee", "lightweight-pants", "sneakers"], ["tank-top", "tailored-shorts", "sandals"]],
  },
  Temperate: {
    masculine: [["long-sleeve-tee", "jeans", "sneakers"], ["button-up", "chinos", "loafers"], ["lightweight-tee", "lightweight-pants", "denim-jacket", "sneakers"]],
    feminine: [["knit-top", "jeans", "sneakers"], ["breathable-blouse", "skirt", "light-cardigan", "loafers"], ["knit-top", "lightweight-pants", "denim-jacket", "sneakers"]],
  },
  Cool: {
    masculine: [["long-sleeve-tee", "jeans", "denim-jacket", "sneakers"], ["sweater", "chinos", "loafers"], ["button-up", "jeans", "windbreaker", "sneakers"]],
    feminine: [["knit-top", "jeans", "light-cardigan", "ankle-boots"], ["sweater", "skirt", "denim-jacket", "ankle-boots"], ["long-sleeve-tee", "jeans", "windbreaker", "sneakers"]],
  },
  Cold: {
    masculine: [["sweater", "jeans", "puffer-jacket", "water-resistant-boots"], ["thermal-top", "chinos", "wool-coat", "loafers"], ["long-sleeve-tee", "jeans", "windbreaker", "knit-hat", "water-resistant-boots"]],
    feminine: [["turtleneck", "jeans", "wool-coat", "ankle-boots"], ["turtleneck", "jeans", "puffer-jacket", "water-resistant-boots"], ["knit-top", "jeans", "windbreaker", "knit-hat", "ankle-boots"]],
  },
  Freezing: {
    masculine: [["thermal-top", "insulated-pants", "insulated-parka", "knit-hat", "gloves", "winter-boots"], ["sweater", "insulated-pants", "puffer-jacket", "scarf", "gloves", "winter-boots"], ["thermal-top", "insulated-pants", "wool-coat", "knit-hat", "gloves", "water-resistant-boots"]],
    feminine: [["turtleneck", "insulated-pants", "insulated-parka", "knit-hat", "gloves", "winter-boots"], ["turtleneck", "insulated-pants", "puffer-jacket", "scarf", "gloves", "winter-boots"], ["sweater", "insulated-pants", "wool-coat", "knit-hat", "gloves", "water-resistant-boots"]],
  },
};

const party = {
  Hot: {
    masculine: [["polo", "tailored-shorts", "loafers"], ["polo", "lightweight-pants", "sneakers"], ["lightweight-tee", "tailored-shorts", "sneakers"]],
    feminine: [["summer-dress", "sandals"], ["dressy-blouse", "skirt", "sandals"], ["breathable-blouse", "tailored-shorts", "loafers"]],
  },
  Warm: {
    masculine: [["oxford-shirt", "dress-pants", "loafers"], ["polo", "chinos", "loafers"], ["button-up", "lightweight-pants", "sneakers"]],
    feminine: [["summer-dress", "sandals"], ["dressy-blouse", "skirt", "loafers"], ["breathable-blouse", "lightweight-pants", "sandals"]],
  },
  Temperate: {
    masculine: [["oxford-shirt", "dress-pants", "blazer", "loafers"], ["button-up", "chinos", "loafers"], ["long-sleeve-tee", "dress-pants", "blazer", "sneakers"]],
    feminine: [["midi-dress", "light-cardigan", "loafers"], ["dressy-blouse", "skirt", "blazer", "ankle-boots"], ["knit-top", "lightweight-pants", "light-cardigan", "loafers"]],
  },
  Cool: {
    masculine: [["oxford-shirt", "dress-pants", "blazer", "loafers"], ["sweater", "chinos", "blazer", "loafers"], ["button-up", "dress-pants", "windbreaker", "sneakers"]],
    feminine: [["midi-dress", "blazer", "ankle-boots"], ["dressy-blouse", "skirt", "blazer", "ankle-boots"], ["knit-top", "jeans", "light-cardigan", "loafers"]],
  },
  Cold: {
    masculine: [["oxford-shirt", "dress-pants", "wool-coat", "loafers"], ["sweater", "chinos", "blazer", "water-resistant-boots"], ["thermal-top", "dress-pants", "puffer-jacket", "loafers"]],
    feminine: [["sweater-dress", "wool-coat", "ankle-boots"], ["dressy-blouse", "jeans", "blazer", "water-resistant-boots"], ["turtleneck", "jeans", "puffer-jacket", "ankle-boots"]],
  },
  Freezing: {
    masculine: [["thermal-top", "insulated-pants", "wool-coat", "scarf", "gloves", "winter-boots"], ["sweater", "insulated-pants", "insulated-parka", "knit-hat", "gloves", "winter-boots"], ["thermal-top", "insulated-pants", "puffer-jacket", "scarf", "gloves", "water-resistant-boots"]],
    feminine: [["sweater-dress", "insulated-parka", "knit-hat", "gloves", "winter-boots"], ["turtleneck", "insulated-pants", "wool-coat", "scarf", "gloves", "winter-boots"], ["thermal-top", "insulated-pants", "puffer-jacket", "knit-hat", "gloves", "water-resistant-boots"]],
  },
};

function makeOutfit(category, occasion, style, index, garmentIds) {
  const palette = occasion === "game-day" ? (index % 2 ? "white with burnt orange accents" : "burnt orange with white accents") : "standard";
  const labels = garmentIds.map((id) => GARMENT_BY_ID.get(id)?.label ?? id);
  const description = labels.length === 1
    ? labels[0]
    : labels.length === 2
      ? `${labels[0]} and ${labels[1]}`
      : `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
  return {
    id: `${category.toLowerCase()}-${occasion}-${style}-${index + 1}`,
    category,
    occasion,
    style,
    garmentIds,
    palette,
    description: `${description}${palette === "standard" ? "" : ` in ${palette}`}`,
  };
}

function buildOutfitMatrix() {
  const entries = [];
  for (const category of CATEGORIES) for (const occasion of OCCASIONS) for (const style of STYLES) {
    const recipes = occasion === "birthday-party" ? party[category][style] : everyday[category][style];
    const key = `${category}|${occasion}|${style}`;
    entries.push([key, Object.freeze(recipes.map((ids, index) => Object.freeze(makeOutfit(category, occasion, style, index, ids))))]);
  }
  return Object.freeze(Object.fromEntries(entries));
}

export const OUTFIT_MATRIX = buildOutfitMatrix();

export function outfitsFor(category, occasion, style) {
  if (style === "none") return [...(OUTFIT_MATRIX[`${category}|${occasion}|masculine`] ?? []), ...(OUTFIT_MATRIX[`${category}|${occasion}|feminine`] ?? [])];
  return [...(OUTFIT_MATRIX[`${category}|${occasion}|${style}`] ?? [])];
}

export function validateOutfitMatrix() {
  const errors = [];
  for (const category of CATEGORIES) for (const occasion of OCCASIONS) for (const style of STYLES) {
    const key = `${category}|${occasion}|${style}`;
    const outfits = OUTFIT_MATRIX[key] ?? [];
    if (outfits.length !== 3) errors.push(`${key} has ${outfits.length} outfits`);
    if (new Set(outfits.map(({ garmentIds }) => garmentIds.join("|"))).size !== outfits.length) errors.push(`${key} contains duplicate outfits`);
    for (const outfit of outfits) {
      const garments = outfit.garmentIds.map((id) => GARMENT_BY_ID.get(id));
      if (garments.some((item) => !item)) errors.push(`${outfit.id} references an unknown garment`);
      if (garments.some((item) => item && !item.categories.includes(category))) errors.push(`${outfit.id} has a temperature-incompatible garment`);
      if (garments.some((item) => item && !item.occasions.includes(occasion))) errors.push(`${outfit.id} has an occasion-incompatible garment`);
      if (garments.some((item) => item && !item.styles.includes(style))) errors.push(`${outfit.id} has a style-incompatible garment`);
      const slots = garments.filter(Boolean).map(({ slot }) => slot);
      const hasDress = slots.includes("dress");
      if (hasDress && (slots.includes("top") || slots.includes("bottom"))) errors.push(`${outfit.id} mixes a dress with a top or bottom`);
      if (!hasDress && (!slots.includes("top") || !slots.includes("bottom"))) errors.push(`${outfit.id} lacks a top, bottom, or dress`);
      if (slots.filter((slot) => slot === "footwear").length !== 1) errors.push(`${outfit.id} must have exactly one footwear item`);
      const layers = garments.filter((item) => item && ["top", "outerwear"].includes(item.slot)).map(({ layer }) => layer);
      if (layers.some((layer, index) => index > 0 && layer < layers[index - 1])) errors.push(`${outfit.id} has invalid layer order`);
    }
  }
  return errors;
}
