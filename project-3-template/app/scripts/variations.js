import { outfitsFor } from "./outfits.js";

export const REMINDER_VARIANTS = Object.freeze({
  "adaptable-layering": [
    ({ timing }) => `Temperatures shift into another clothing range ${timing}. Choose a removable layer.`,
    ({ timing }) => `Conditions change ${timing}, so keep an easy-to-remove layer nearby.`,
    ({ timing }) => `Plan for a temperature shift ${timing} with a layer you can add or take off.`,
  ],
  "rain-protection": [
    ({ timing, context }) => context?.umbrellaUnsafe
      ? `Rain is possible ${timing}. Use broader rain protection and seek suitable shelter instead of relying on an umbrella.`
      : `Rain is possible ${timing}. Bring an umbrella or another rain layer.`,
    ({ timing, context }) => context?.umbrellaUnsafe
      ? `Wet and potentially unsafe umbrella conditions are possible ${timing}. Choose rainwear and suitable shelter.`
      : `Keep rain protection handy ${timing}; an umbrella or rain layer may help.`,
    ({ timing, context }) => context?.umbrellaUnsafe
      ? `Prepare for rain ${timing} with protective clothing and a shelter plan rather than an umbrella.`
      : `An umbrella or packable rain layer could be useful ${timing}.`,
  ],
  "wet-footwear": [
    ({ timing }) => `Wet or wintry surfaces are possible ${timing}. Consider water-resistant, weather-appropriate footwear and use care on slick surfaces.`,
    ({ timing }) => `Choose footwear suited to wet or wintry ground ${timing}, and take care on slick surfaces.`,
    ({ timing }) => `Water-resistant or weather-appropriate shoes may help ${timing}; move carefully where surfaces are slick.`,
  ],
  hydration: [
    ({ timing }) => `It may feel hot ${timing}. Consider carrying water, using shade, and taking breaks.`,
    ({ timing }) => `Plan for heat ${timing} with water, shade, and breaks when needed.`,
    ({ timing }) => `Carry water and look for shade or rest opportunities ${timing}.`,
  ],
  "sun-protection": [
    ({ timing }) => `UV reaches 3 or higher ${timing}. Consider sunscreen, shade, sunglasses, or protective clothing.`,
    ({ timing }) => `Sun protection may be useful ${timing}; consider shade, sunscreen, sunglasses, or coverage.`,
    ({ timing }) => `Prepare for elevated UV ${timing} with the sun-protection option that works for you.`,
  ],
  wind: [
    ({ timing }) => `Strong wind is possible ${timing}. Secure loose items and choose a close-fitting or wind-resistant layer.`,
    ({ timing }) => `Wind may pick up ${timing}; secure loose belongings and consider a wind-resistant layer.`,
    ({ timing }) => `Choose close-fitting layers and keep loose items secure ${timing}.`,
  ],
});

export function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicIndex(key, length) {
  if (!Number.isInteger(length) || length <= 0) throw new RangeError("Variation length must be positive.");
  return stableHash(key) % length;
}

export function recommendationSignature(recommendation) {
  const activeConditions = Object.entries(recommendation.conditions)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
    .sort()
    .join(",");
  return `${recommendation.temperature.category ?? "unavailable"}|${activeConditions}|${recommendation.dataQuality.limited}`;
}

export function variationKey({ location, date, recommendation, occasion, style }) {
  return `${location.id}|${date}|${recommendationSignature(recommendation)}|${occasion}|${style}`;
}

export function selectOutfit({ location, date, recommendation, occasion, style, history }) {
  const outfits = outfitsFor(recommendation.temperature.category, occasion, style);
  if (!outfits.length) return { outfit: null, options: [], index: -1, count: 0, key: null };
  const key = variationKey({ location, date, recommendation, occasion, style });
  const storedIndex = history.get(key);
  const index = Number.isInteger(storedIndex) ? storedIndex % outfits.length : deterministicIndex(`${key}|outfit`, outfits.length);
  return { outfit: outfits[index], options: outfits, index, count: outfits.length, key };
}

export function cycleOutfit(selection, direction, history) {
  if (!selection.count || !selection.key) return selection;
  const index = (selection.index + direction + selection.count) % selection.count;
  history.set(selection.key, index);
  return { ...selection, outfit: selection.options[index], index };
}

export function applyReminderVariations(recommendation, context) {
  const baseKey = variationKey({ ...context, recommendation, date: recommendation.date });
  return recommendation.reminders.map((reminder) => {
    const variants = REMINDER_VARIANTS[reminder.type];
    if (!variants?.length) return reminder;
    const index = deterministicIndex(`${baseKey}|reminder|${reminder.type}`, variants.length);
    return { ...reminder, variantIndex: index, text: variants[index](reminder) };
  });
}

export const VARIATIONS_MODULE_READY = true;
