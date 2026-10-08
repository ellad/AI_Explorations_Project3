import { renderRoute, routeFromHash } from "./router.js";
import { initializeLocationController } from "./location-controller.js";
import { renderForecast, renderHourlyForecast, renderOutfit, renderRecommendation, renderWeatherError, renderWeatherLoading } from "./render.js";
import { buildRecommendation } from "./recommendations.js";
import { createInitialState } from "./state.js";
import { applyReminderVariations, cycleOutfit, selectOutfit } from "./variations.js";
import { fetchForecast } from "./weather.js";

const appState = createInitialState();
let weatherRequest = null;

function selectForecastDate(date) {
  const day = appState.forecast?.days.find((candidate) => candidate.date === date);
  if (!day) return;
  appState.selectedDate = date;
  appState.recommendation = buildRecommendation(day);
  const variationContext = {
    location: appState.location,
    occasion: appState.preferences.occasion,
    style: appState.preferences.style,
  };
  appState.outfitSelection = selectOutfit({
    ...variationContext,
    date,
    recommendation: appState.recommendation,
    history: appState.outfitHistory,
  });
  const variedRecommendation = {
    ...appState.recommendation,
    reminders: applyReminderVariations(appState.recommendation, variationContext),
  };
  renderForecast(appState.forecast, appState.location, date, selectForecastDate);
  renderHourlyForecast(day, appState.forecast.current?.time);
  renderRecommendation(variedRecommendation);
  renderOutfit(appState.outfitSelection, variedRecommendation);
}

async function loadWeather(location) {
  weatherRequest?.abort();
  const request = new AbortController();
  weatherRequest = request;
  appState.status = "loading-weather";
  renderWeatherLoading(location);
  try {
    const forecast = await fetchForecast(location, { signal: request.signal });
    if (weatherRequest !== request) return;
    appState.forecast = forecast;
    appState.selectedDate = forecast.days[0]?.date ?? null;
    appState.status = forecast.quality.partial ? "partial-weather" : "weather-ready";
    document.querySelector("#style-preferences").disabled = false;
    document.querySelector("#occasion-preferences").disabled = false;
    selectForecastDate(appState.selectedDate);
  } catch (error) {
    if (error.name === "AbortError" || weatherRequest !== request) return;
    appState.status = "weather-error";
    renderWeatherError(error, location, () => loadWeather(location));
  }
}

initializeLocationController(appState, { onLocationSelected: loadWeather });

for (const input of document.querySelectorAll('input[name="style"], input[name="occasion"]')) {
  input.addEventListener("change", () => {
    appState.preferences[input.name] = input.value;
    if (appState.forecast && appState.selectedDate) selectForecastDate(appState.selectedDate);
  });
}

function moveOutfit(direction) {
  if (!appState.outfitSelection) return;
  appState.outfitSelection = cycleOutfit(appState.outfitSelection, direction, appState.outfitHistory);
  renderOutfit(appState.outfitSelection, appState.recommendation);
}

document.querySelector("#previous-outfit").addEventListener("click", () => moveOutfit(-1));
document.querySelector("#next-outfit").addEventListener("click", () => moveOutfit(1));

function updateRoute({ moveFocus = false } = {}) {
  const route = renderRoute(routeFromHash(window.location.hash));
  const status = document.querySelector("#route-status");
  status.textContent = route === "about" ? "About Cloud Closet" : "Cloud Closet forecast";
  if (moveFocus) document.querySelector(route === "about" ? "#about-title" : "#home-title").focus();
}

window.addEventListener("hashchange", () => updateRoute({ moveFocus: true }));
updateRoute();

export { appState };
