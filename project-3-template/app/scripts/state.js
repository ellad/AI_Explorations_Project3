export const DEFAULT_PREFERENCES = Object.freeze({
  style: "none",
  occasion: "everyday",
});

export function createInitialState() {
  return {
    location: null,
    forecast: null,
    recommendation: null,
    outfitSelection: null,
    outfitHistory: new Map(),
    selectedDate: null,
    preferences: { ...DEFAULT_PREFERENCES },
    status: "awaiting-location",
  };
}
