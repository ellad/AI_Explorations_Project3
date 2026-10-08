import { describeWeatherCode } from "./weather.js";
import { REMINDER_ICONS, accessoryAssetsFor, bottomAssetFor, dressAssetFor, footwearAssetFor, outerwearAssetFor, topAssetFor, weatherIconFor } from "./assets.js";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(localDate) {
  return dateFormatter.format(new Date(`${localDate}T00:00:00Z`));
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°` : "Unavailable";
}

function formatHour(localTime) {
  if (!localTime) return "Time unavailable";
  const [hour, minute] = localTime.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function createWeatherIcon(weather, root = document) {
  const icon = root.createElement("img");
  icon.className = "weather-icon";
  icon.src = weatherIconFor(weather);
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

export function findCurrentHourIndex(day, currentTime) {
  if (!currentTime || day.date !== currentTime.slice(0, 10)) return -1;
  const currentHour = currentTime.slice(0, 13);
  const index = day.hours.findIndex(({ time }) => time?.slice(0, 13) === currentHour);
  return index;
}

export function shouldShowUmbrella(recommendation) {
  return Boolean(
    recommendation?.conditions?.rainProtection
    && !recommendation.conditions.strongWind
    && !recommendation.notices?.some(({ type }) => type === "thunderstorm"),
  );
}

export function renderWeatherLoading(location, root = document) {
  const strip = root.querySelector(".forecast-strip");
  strip.setAttribute("aria-busy", "true");
  const existingStatus = strip.querySelector(".forecast-status");
  if (existingStatus) existingStatus.textContent = `Loading a fresh forecast for ${location.label}…`;
  else {
    const status = document.createElement("div");
    status.className = "empty-placeholder forecast-status";
    status.setAttribute("role", "status");
    status.textContent = `Loading a fresh forecast for ${location.label}…`;
    if (strip.querySelector(".forecast-days")) strip.append(status);
    else strip.replaceChildren(status);
  }
}

export function renderForecast(forecast, location, selectedDate, onDateSelected, root = document) {
  const strip = root.querySelector(".forecast-strip");
  const headingText = root.querySelector(".section-heading p");
  const cards = document.createElement("div");
  cards.className = "forecast-days";

  for (const [index, day] of forecast.days.entries()) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "forecast-day";
    card.dataset.date = day.date;
    card.setAttribute("aria-pressed", String(day.date === selectedDate));
    if (day.date === selectedDate) {
      card.dataset.selected = "true";
      card.setAttribute("aria-current", "date");
    }
    const title = document.createElement("h3");
    title.textContent = index === 0 ? `Today · ${formatDate(day.date)}` : formatDate(day.date);
    const condition = document.createElement("p");
    condition.textContent = day.summary.condition;
    condition.className = "weather-condition";
    condition.prepend(createWeatherIcon({ code: day.summary.weatherCode }, root));
    const temperature = document.createElement("p");
    temperature.className = "forecast-temperatures";
    temperature.textContent = `${formatTemperature(day.summary.maximumTemperature)} / ${formatTemperature(day.summary.minimumTemperature)}`;
    card.append(title, condition, temperature);
    card.addEventListener("click", () => onDateSelected(day.date));
    cards.append(card);
  }

  strip.replaceChildren(cards);
  strip.removeAttribute("aria-busy");
  headingText.textContent = `${location.label} · Local time (${forecast.timezoneAbbreviation ?? forecast.timezone ?? "time zone unavailable"})`;
  if (forecast.current) {
    const currentCondition = describeWeatherCode(forecast.current.weatherCode);
    headingText.textContent += ` · Current: ${formatTemperature(forecast.current.temperature)}, ${currentCondition}`;
  }
  if (forecast.quality.partial) {
    const notice = document.createElement("p");
    notice.className = "forecast-data-notice";
    notice.textContent = "Some forecast values are unavailable. Available values are shown without substituting zeroes.";
    strip.append(notice);
  }
}

export function renderHourlyForecast(day, currentTime, root = document) {
  const strip = root.querySelector("#hourly-strip");
  const dateLabel = root.querySelector("#hourly-date");
  dateLabel.textContent = `${formatDate(day.date)} · Times shown in the selected location's local time`;
  strip.setAttribute("aria-label", `Hourly forecast for ${formatDate(day.date)}`);

  if (!day.hours.length) {
    const unavailable = document.createElement("p");
    unavailable.className = "empty-placeholder";
    unavailable.textContent = "Hourly forecast data is unavailable for this date.";
    strip.replaceChildren(unavailable);
    return;
  }

  const hours = document.createElement("div");
  hours.className = "hourly-hours";
  for (const [index, hour] of day.hours.entries()) {
    const card = document.createElement("article");
    card.className = "hour-card";
    if (index === findCurrentHourIndex(day, currentTime)) card.dataset.current = "true";
    const time = document.createElement("h3");
    time.textContent = formatHour(hour.localTime);
    const condition = document.createElement("p");
    condition.textContent = describeWeatherCode(hour.weatherCode);
    condition.className = "weather-condition";
    condition.prepend(createWeatherIcon({
      code: hour.weatherCode,
      localTime: hour.localTime,
      windSpeed: hour.windSpeed,
      windGust: hour.windGust,
    }, root));
    const temperature = document.createElement("p");
    temperature.className = "hour-temperature";
    temperature.textContent = formatTemperature(hour.temperature);
    const precipitation = document.createElement("p");
    precipitation.className = "hour-precipitation";
    precipitation.textContent = Number.isFinite(hour.precipitationProbability)
      ? `${Math.round(hour.precipitationProbability)}% precipitation`
      : "Precipitation unavailable";
    card.append(time, condition, temperature, precipitation);
    hours.append(card);
  }
  strip.replaceChildren(hours);

  const initialIndex = Math.max(0, findCurrentHourIndex(day, currentTime));
  requestAnimationFrame(() => {
    const initialCard = hours.children[initialIndex];
    if (initialCard) strip.scrollLeft = Math.max(0, initialCard.offsetLeft - strip.clientWidth / 3);
  });
}

function renderGuidanceList(section, items, emptyMessage, { icons = null } = {}) {
  const previous = section.querySelector(".guidance-content");
  const content = document.createElement("div");
  content.className = "guidance-content";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.textContent = emptyMessage;
    content.append(empty);
  } else {
    const list = document.createElement("ul");
    for (const item of items) {
      const listItem = document.createElement("li");
      if (icons?.[item.type]) {
        listItem.className = "reminder-item";
        const icon = document.createElement("img");
        icon.className = "reminder-icon";
        icon.src = icons[item.type];
        icon.alt = "";
        icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = item.text;
        listItem.append(icon, text);
      } else listItem.textContent = item.text;
      list.append(listItem);
    }
    content.append(list);
  }
  if (previous) previous.replaceWith(content);
  else section.append(content);
}

export function renderRecommendation(recommendation, root = document) {
  const wearSection = root.querySelector('[aria-labelledby="wear-title"]');
  const bringSection = root.querySelector('[aria-labelledby="bring-title"]');
  const noticesSection = root.querySelector('[aria-labelledby="notices-title"]');
  const confidence = recommendation.dataQuality.limited
    ? `Limited forecast data: ${recommendation.dataQuality.usableTemperatureHours} of 13 daytime temperature hours are available. `
    : "";
  const median = Number.isFinite(recommendation.temperature.median)
    ? ` The daytime median feels-like temperature is ${Math.round(recommendation.temperature.median)}°F.`
    : "";

  renderGuidanceList(wearSection, [{
    text: `${confidence}${recommendation.wear.category ? `${recommendation.wear.category}: ` : ""}${recommendation.wear.text}${median}`,
  }], "A clothing recommendation is unavailable.");
  renderGuidanceList(bringSection, recommendation.reminders, "No additional forecast-based items are suggested for the daytime window.", { icons: REMINDER_ICONS });
  renderGuidanceList(noticesSection, recommendation.notices, "No forecast-based weather notices for the daytime window.");
}

export function renderOutfit(selection, recommendation = null, root = document) {
  const description = root.querySelector("#outfit-description");
  const previous = root.querySelector("#previous-outfit");
  const next = root.querySelector("#next-outfit");
  const illustration = root.querySelector("#outfit-illustration");
  const weatherPropLayer = illustration.querySelector('[data-layer="weather-prop"]');
  const bottomLayer = illustration.querySelector('[data-layer="bottom"]');
  const topLayer = illustration.querySelector('[data-layer="top"]');
  const dressLayer = illustration.querySelector('[data-layer="dress"]');
  const outerwearLayer = illustration.querySelector('[data-layer="outerwear"]');
  const footwearLayer = illustration.querySelector('[data-layer="footwear"]');
  const neckAccessoryLayer = illustration.querySelector('[data-layer="neck-accessory"]');
  const accessoryLayers = [...illustration.querySelectorAll('[data-layer="accessory"]')];
  const available = Boolean(selection?.outfit);
  previous.disabled = !available;
  next.disabled = !available;
  if (!available) {
    description.textContent = "An outfit is unavailable for this forecast.";
    for (const layer of [weatherPropLayer, bottomLayer, topLayer, dressLayer, outerwearLayer, footwearLayer, neckAccessoryLayer, ...accessoryLayers]) {
      layer.setAttribute("hidden", "");
      layer.removeAttribute("href");
    }
    illustration.setAttribute("aria-label", "Character without an outfit recommendation");
    return;
  }
  description.textContent = `${selection.outfit.description}. Outfit ${selection.index + 1} of ${selection.count}.`;
  const bottom = bottomAssetFor(selection.outfit.garmentIds);
  const top = topAssetFor(selection.outfit.garmentIds);
  const dress = dressAssetFor(selection.outfit.garmentIds);
  const outerwear = outerwearAssetFor(selection.outfit.garmentIds);
  const footwear = footwearAssetFor(selection.outfit.garmentIds);
  for (const [layer, asset] of [[bottomLayer, bottom], [topLayer, top], [dressLayer, dress], [outerwearLayer, outerwear], [footwearLayer, footwear]]) {
    if (asset) {
      layer.setAttribute("href", asset.path);
      if (asset.height) layer.setAttribute("height", asset.height);
      layer.removeAttribute("hidden");
    } else {
      layer.setAttribute("hidden", "");
      layer.removeAttribute("href");
    }
  }
  const umbrellaAllowed = shouldShowUmbrella(recommendation);
  const [umbrella] = accessoryAssetsFor(umbrellaAllowed ? ["umbrella"] : []);
  if (umbrella) {
    weatherPropLayer.setAttribute("href", umbrella.path);
    for (const [name, value] of Object.entries(umbrella.placement)) weatherPropLayer.setAttribute(name, value);
    weatherPropLayer.removeAttribute("hidden");
  } else {
    weatherPropLayer.setAttribute("hidden", "");
    weatherPropLayer.removeAttribute("href");
  }
  const [scarf] = accessoryAssetsFor(selection.outfit.garmentIds.filter((id) => id === "scarf"));
  if (scarf) {
    neckAccessoryLayer.setAttribute("href", scarf.path);
    for (const [name, value] of Object.entries(scarf.placement)) neckAccessoryLayer.setAttribute(name, value);
    neckAccessoryLayer.removeAttribute("hidden");
  } else {
    neckAccessoryLayer.setAttribute("hidden", "");
    neckAccessoryLayer.removeAttribute("href");
  }
  const accessories = accessoryAssetsFor(selection.outfit.garmentIds.filter((id) => id !== "scarf"));
  accessoryLayers.forEach((layer, index) => {
    const asset = accessories[index];
    if (asset) {
      layer.setAttribute("href", asset.path);
      for (const [name, value] of Object.entries(asset.placement)) layer.setAttribute(name, value);
      layer.removeAttribute("hidden");
    } else {
      layer.setAttribute("hidden", "");
      layer.removeAttribute("href");
    }
  });
  illustration.setAttribute("aria-label", `Character wearing ${selection.outfit.description}`);
}

export function renderWeatherError(error, location, retry, root = document) {
  const strip = root.querySelector(".forecast-strip");
  strip.removeAttribute("aria-busy");
  let status = strip.querySelector(".forecast-status");
  if (!status) {
    status = document.createElement("div");
    status.className = "forecast-status";
    strip.append(status);
  }
  status.replaceChildren();
  const message = document.createElement("p");
  message.textContent = `${error.message} The selected location is still ${location.label}.`;
  const button = document.createElement("button");
  button.className = "button button-secondary";
  button.type = "button";
  button.textContent = "Retry forecast";
  button.addEventListener("click", retry, { once: true });
  status.append(message, button);
}

export const RENDER_MODULE_READY = true;
