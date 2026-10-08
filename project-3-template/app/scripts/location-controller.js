import {
  STATES,
  cityToLocation,
  findCitySuggestions,
  getStateName,
  isExactZip,
  loadSavedLocation,
  loadStatePlaces,
  lookupZip,
  requestDeviceLocation,
  saveLocation,
} from "./locations.js";

export function initializeLocationController(state, { root = document, onLocationSelected = () => {} } = {}) {
  const elements = {
    form: root.querySelector("#location-form"),
    state: root.querySelector("#state"),
    query: root.querySelector("#location-query"),
    suggestions: root.querySelector("#city-suggestions"),
    deviceButton: root.querySelector("#use-device-location"),
    status: root.querySelector("#location-status"),
    heading: root.querySelector("#location-title"),
    intro: root.querySelector(".location-intro > p:last-child"),
    selected: root.querySelector("#selected-location"),
    selectedName: root.querySelector("#selected-location-name"),
    forecastPlaceholder: root.querySelector(".forecast-strip .empty-placeholder"),
  };
  let suggestions = [];
  let activeIndex = -1;
  let searchSequence = 0;

  for (const [value, label] of STATES) elements.state.add(new Option(label, value));

  function setStatus(message, type = "") {
    elements.status.textContent = message;
    elements.status.dataset.type = type;
  }

  function closeSuggestions() {
    suggestions = [];
    activeIndex = -1;
    elements.suggestions.replaceChildren();
    elements.suggestions.hidden = true;
    elements.query.setAttribute("aria-expanded", "false");
    elements.query.setAttribute("aria-activedescendant", "");
  }

  function setActiveSuggestion(index) {
    if (!suggestions.length) return;
    activeIndex = (index + suggestions.length) % suggestions.length;
    const options = elements.suggestions.querySelectorAll('[role="option"]');
    options.forEach((option, optionIndex) => option.setAttribute("aria-selected", String(optionIndex === activeIndex)));
    const activeOption = options[activeIndex];
    elements.query.setAttribute("aria-activedescendant", activeOption.id);
    activeOption.scrollIntoView({ block: "nearest" });
  }

  function selectLocation(location, message) {
    state.location = location;
    state.status = "location-selected";
    saveLocation(location);
    elements.heading.textContent = location.label;
    elements.intro.textContent = "Your latest location is ready for a fresh forecast.";
    elements.selectedName.textContent = location.label;
    elements.selected.hidden = false;
    if (elements.forecastPlaceholder) elements.forecastPlaceholder.textContent = "Loading your forecast…";
    setStatus(message ?? `${location.label} selected.`);
    closeSuggestions();
    onLocationSelected(location);
  }

  function chooseSuggestion(index) {
    const place = suggestions[index];
    if (!place) return;
    elements.query.value = place.name;
    const stateCode = elements.state.value;
    selectLocation(cityToLocation(place, stateCode), `${place.name}, ${getStateName(stateCode)} selected.`);
  }

  function renderSuggestions(matches) {
    suggestions = matches;
    activeIndex = -1;
    elements.suggestions.replaceChildren();
    for (const [index, place] of suggestions.entries()) {
      const option = document.createElement("li");
      option.id = `city-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = `${place.name}, ${getStateName(elements.state.value)}`;
      option.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        chooseSuggestion(index);
      });
      elements.suggestions.append(option);
    }
    elements.suggestions.hidden = suggestions.length === 0;
    elements.query.setAttribute("aria-expanded", String(suggestions.length > 0));
  }

  async function updateCitySuggestions() {
    const query = elements.query.value;
    const stateCode = elements.state.value;
    const currentSequence = ++searchSequence;
    if (isExactZip(query) || query.trim().length < 2) {
      closeSuggestions();
      setStatus("");
      return;
    }
    if (/^\d+$/.test(query.trim())) {
      closeSuggestions();
      setStatus("Enter all five digits of the ZIP code.", "error");
      return;
    }
    if (!stateCode) {
      closeSuggestions();
      setStatus("Choose a state to search for a city.", "error");
      return;
    }

    elements.query.setAttribute("aria-busy", "true");
    setStatus(`Loading ${getStateName(stateCode)} cities…`);
    try {
      const records = await loadStatePlaces(stateCode);
      if (currentSequence !== searchSequence) return;
      const matches = findCitySuggestions(records, query);
      renderSuggestions(matches);
      setStatus(matches.length ? `${matches.length} city suggestions available.` : "No matching city was found. Check the spelling or try a ZIP code.", matches.length ? "" : "error");
    } catch {
      if (currentSequence !== searchSequence) return;
      closeSuggestions();
      setStatus("The city list could not be loaded. Try again, enter a ZIP code, or use your device location.", "error");
    } finally {
      if (currentSequence === searchSequence) elements.query.removeAttribute("aria-busy");
    }
  }

  elements.query.addEventListener("input", updateCitySuggestions);
  elements.state.addEventListener("change", () => {
    closeSuggestions();
    if (elements.query.value.trim()) updateCitySuggestions();
  });
  elements.query.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setActiveSuggestion(activeIndex + 1);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveSuggestion(activeIndex - 1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(activeIndex);
    } else if (event.key === "Escape") closeSuggestions();
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = elements.query.value.trim();
    if (!query) {
      setStatus("Enter a city or five-digit ZIP code.", "error");
      elements.query.focus();
      return;
    }
    if (isExactZip(query)) {
      setStatus(`Looking up ZIP code ${query}…`);
      try {
        const location = await lookupZip(query);
        if (location) selectLocation(location);
        else setStatus("That ZIP code is not represented in Census ZCTA data. Try a city and state or use your device location.", "error");
      } catch {
        setStatus("The ZIP index could not be loaded. Try again, search by city, or use your device location.", "error");
      }
      return;
    }
    if (/^\d+$/.test(query)) {
      setStatus("Enter an exact five-digit ZIP code.", "error");
      elements.query.focus();
      return;
    }
    if (!elements.state.value) {
      setStatus("Choose a state before searching for a city.", "error");
      elements.state.focus();
      return;
    }
    try {
      const stateCode = elements.state.value;
      const records = await loadStatePlaces(stateCode);
      const matches = findCitySuggestions(records, query, records.length);
      const exactMatches = matches.filter(({ name }) => name.localeCompare(query, undefined, { sensitivity: "base" }) === 0);
      if (exactMatches.length === 1) {
        elements.query.value = exactMatches[0].name;
        selectLocation(cityToLocation(exactMatches[0], stateCode), `${exactMatches[0].name}, ${getStateName(stateCode)} selected.`);
      } else {
        renderSuggestions(matches.slice(0, 8));
        setStatus(exactMatches.length > 1 ? "More than one matching place exists. Choose the intended suggestion." : "Choose a city from the suggestions or check the spelling.", "error");
      }
    } catch {
      setStatus("The city list could not be loaded. Try again, enter a ZIP code, or use your device location.", "error");
    }
  });

  elements.deviceButton.addEventListener("click", async () => {
    elements.deviceButton.disabled = true;
    setStatus("Waiting for device location permission…");
    try {
      selectLocation(await requestDeviceLocation(), "Current device location selected.");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      elements.deviceButton.disabled = false;
    }
  });

  const savedLocation = loadSavedLocation();
  if (savedLocation) {
    selectLocation(savedLocation, `${savedLocation.label} restored. Loading a fresh forecast.`);
    if (savedLocation.type === "zip" && savedLocation.name) {
      lookupZip(savedLocation.name).then((enrichedLocation) => {
        if (enrichedLocation && enrichedLocation.label !== savedLocation.label) {
          selectLocation(enrichedLocation, `${enrichedLocation.label} restored. Loading a fresh forecast.`);
        }
      }).catch(() => {});
    }
  }
  return { selectLocation, closeSuggestions };
}
