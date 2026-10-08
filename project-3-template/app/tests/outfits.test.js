import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CATEGORIES,
  GARMENTS,
  OCCASIONS,
  OUTFIT_MATRIX,
  STYLES,
  outfitsFor,
  validateOutfitMatrix,
} from "../scripts/outfits.js";
import {
  REMINDER_VARIANTS,
  applyReminderVariations,
  cycleOutfit,
  deterministicIndex,
  selectOutfit,
  stableHash,
} from "../scripts/variations.js";

const location = { id: "place:4805000", label: "Austin, TX" };
const recommendation = {
  date: "2026-10-05",
  temperature: { category: "Warm" },
  dataQuality: { limited: false },
  conditions: { hydration: true, sunProtection: true, rainProtection: false },
  reminders: [
    { type: "hydration", timing: "around 2 PM", context: {}, text: "base hydration" },
    { type: "sun-protection", timing: "11 AM–3 PM", context: {}, text: "base sun" },
  ],
};

test("the catalog matches the planned reusable garment inventory", () => {
  const counts = Object.groupBy(GARMENTS, ({ slot }) => slot);
  assert.equal(counts.top.length, 12);
  assert.equal(counts.bottom.length, 8);
  assert.equal(counts.dress.length, 3);
  assert.equal(counts.outerwear.length, 8);
  assert.equal(counts.footwear.length, 6);
  assert.equal(counts.accessory.length, 5);
});

test("the matrix contains three valid outfits in all 36 groups and 108 total slots", () => {
  assert.equal(Object.keys(OUTFIT_MATRIX).length, CATEGORIES.length * OCCASIONS.length * STYLES.length);
  assert.equal(Object.values(OUTFIT_MATRIX).flat().length, 108);
  assert.deepEqual(validateOutfitMatrix(), []);
});

test("No preference exposes all six compatible outfits", () => {
  for (const category of CATEGORIES) for (const occasion of OCCASIONS) {
    const options = outfitsFor(category, occasion, "none");
    assert.equal(options.length, 6, `${category} ${occasion}`);
    assert.equal(new Set(options.map(({ id }) => id)).size, 6);
    assert.equal(new Set(options.map(({ garmentIds }) => garmentIds.join("|"))).size, 6, `${category} ${occasion} has a visible duplicate`);
  }
});

test("Game day outfits use burnt orange and white without separate assets", () => {
  const options = outfitsFor("Warm", "game-day", "none");
  assert.equal(options.every(({ palette }) => /burnt orange/.test(palette) && /white/.test(palette)), true);
});

test("stable hashing and deterministic indexes reproduce the same initial outfit", () => {
  assert.equal(stableHash("Cloud Closet"), stableHash("Cloud Closet"));
  assert.equal(deterministicIndex("same-key", 6), deterministicIndex("same-key", 6));
  const input = { location, date: recommendation.date, recommendation, occasion: "everyday", style: "none" };
  const first = selectOutfit({ ...input, history: new Map() });
  const second = selectOutfit({ ...input, history: new Map() });
  assert.equal(first.outfit.id, second.outfit.id);
  assert.equal(first.count, 6);
});

test("outfit arrows wrap through exactly three or six options", () => {
  for (const [style, count] of [["masculine", 3], ["none", 6]]) {
    const history = new Map();
    let selection = selectOutfit({ location, date: recommendation.date, recommendation, occasion: "everyday", style, history });
    const initialId = selection.outfit.id;
    for (let step = 0; step < count; step += 1) selection = cycleOutfit(selection, 1, history);
    assert.equal(selection.outfit.id, initialId);
    selection = cycleOutfit(selection, -1, history);
    assert.equal(selection.index, (deterministicIndex(`${selection.key}|outfit`, count) - 1 + count) % count);
  }
});

test("manual outfit choices return during the visit but a new visit resets deterministically", () => {
  const input = { location, date: recommendation.date, recommendation, occasion: "everyday", style: "none" };
  const history = new Map();
  const initial = selectOutfit({ ...input, history });
  const changed = cycleOutfit(initial, 1, history);
  const returned = selectOutfit({ ...input, history });
  const newVisit = selectOutfit({ ...input, history: new Map() });
  assert.equal(returned.outfit.id, changed.outfit.id);
  assert.equal(newVisit.outfit.id, initial.outfit.id);
});

test("every reminder type has at least three meaning-equivalent variants", () => {
  assert.deepEqual(Object.keys(REMINDER_VARIANTS).sort(), ["adaptable-layering", "hydration", "rain-protection", "sun-protection", "wet-footwear", "wind"]);
  assert.equal(Object.values(REMINDER_VARIANTS).every((variants) => variants.length >= 3), true);
});

test("outfit cycling cannot alter separately keyed reminder wording", () => {
  const context = { location, occasion: "everyday", style: "none" };
  const before = applyReminderVariations(recommendation, context);
  const history = new Map();
  const selection = selectOutfit({ ...context, date: recommendation.date, recommendation, history });
  cycleOutfit(selection, 1, history);
  const after = applyReminderVariations(recommendation, context);
  assert.deepEqual(after, before);
  assert.equal(before.every(({ variantIndex }) => Number.isInteger(variantIndex)), true);
});

test("variation code does not access persistent browser storage", async () => {
  const source = await readFile(new URL("../scripts/variations.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
});
