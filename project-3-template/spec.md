# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved research, project brief, and hand-drawn screen designs into testable requirements.

## Instructions for the Developer

Make and approve the product decisions, draw every proposed screen, provide the drawings to the Agent, and keep this file current as the intended result changes.

To begin, open the project repository in a fresh chat and enter:

`Read ./spec.md and help me begin the Project 3 specification.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, and this file. Review the screen drawings the Developer provides. Ask one focused question at a time, surface gaps and trade-offs without inventing requirements, and keep the specification concise and testable.

## Goal

Cloud Closet helps a US college student decide what to wear and bring for a day away from home by translating a live weather forecast into an illustrated outfit, written guidance, and time-specific reminders. It prioritizes preparing for rain, wet walking surfaces, heat, sun exposure, wind, and temperature changes without requiring the User to interpret raw forecast data alone.

The primary user story is:

> As someone who walks around campus and may stay until evening, I want to prepare for rain before leaving home, so I can stay dry and choose footwear suited to wet campus paths throughout my day.

The app also supports planning for another US location, understanding an unfamiliar climate, and accessing all advice without relying on the character illustration. Air quality remains a stretch goal rather than a core user story.

## Screen designs

The approved direction uses two primary screens. Location search is a control region within the main screen rather than a third screen.

- Main screen, laptop layout: [IMG_0427](reference/IMG_0427.png). This drawing primarily establishes the wide layout: the seven-day forecast spans the top; the character and controls occupy the left side; and recommendations, reminders, and notices use a right column.
- Main screen, phone layout and art exploration: [IMG_0428](reference/IMG_0428.png). This drawing establishes the stacked hierarchy and the friendly illustrated character style. The character remains prominent and may hold or appear with a reminder object such as an umbrella.
- Information screen, laptop layout: [IMG_0429](reference/IMG_0429.jpg). Content uses ordinary headings and visible sections within a wide, centered reading area.
- Information screen, phone layout: [IMG_0430](reference/IMG_0430.jpg). The same information sections stack into one vertically scrollable page.

The main screen header shows the Cloud Closet name and an information icon on the opposite side. The icon has the accessible name `About Cloud Closet`. The information screen provides a clearly labeled back control. Its content is not hidden in accordions.

On both main-screen layouts, the content order is location search, seven-day forecast strip, character and outfit controls, Wear guidance, Bring reminders, and Weather notices. Laptop composition uses two columns below the forecast strip. Phone composition becomes one vertical column, keeps the character near the top, and uses controls sized for one-handed operation.

## Requirements

### 1. Live forecast and date selection

The app uses Open-Meteo as its only live weather provider. It requests current conditions and seven days of hourly forecast data in US customary units, including air temperature, apparent temperature, precipitation probability and amount, weather code, sustained wind, wind gusts, and UV index. Dates and hours are interpreted in the selected location's local time zone.

The main screen shows the selected US location, selected date, Fahrenheit units, and whether displayed values are current conditions or forecasts. A seven-item date strip supports today plus the following six days. Each date exposes a readable day/date label, representative condition, and temperature summary. Selecting a date updates the one shared recommendation state and all dependent content.

An hourly strip for the selected date is horizontally scrollable and shows all available hours with local time, temperature, condition, and precipitation probability when available. For today, it initially scrolls to the current local hour but permits scrolling backward.

**Acceptance checks:** A live request succeeds for representative continental US, Alaska, and Hawaii coordinates; the UI renders exactly seven selectable local dates; switching dates updates the character, text, icons, notices, and reminders together; today opens at the current local hour; and labels distinguish current from forecast data.

### 2. Location selection and storage

The location-search area appears above the seven-day forecast. It contains a state selector, a city-or-ZIP text field, and a clearly labeled `Use my location` action within the same control region. After a state is selected, typing a city lazy-loads that state's index and displays matching city suggestions as the User types. Suggestions expose city and state names, support pointer and keyboard selection, and do not select a location merely because focus moves through the list. An exact five-digit ZIP can be submitted without choosing a state. A street address is never required.

On a first visit with no saved location, the app shows a location-first empty state and waits for the User to search or activate `Use my location`. It does not assume Austin, request device permission automatically, or fetch weather before a location is selected. The empty state briefly explains that a location is needed to create the forecast-based outfit.

City searches lazy-load only the selected state's local Census place-data file. The suggestion list communicates loading, no matches, and load failure without blocking ZIP or device-location options. ZIP searches preserve leading zeros, load one local shard according to the ZIP's first digit, and require an exact match. When a ZCTA has one or more named-place intersections in the Census relationship file, its display label uses the place with the largest land-area overlap and includes the ZIP; this representative Census place is not presented as a guaranteed USPS preferred mailing city. A ZCTA without a named-place relationship retains a ZIP-only label. If a ZIP is absent from Census ZCTA data, the interface explains the limitation and offers city/state search or device location.

Device location is requested only after the User activates `Use my location`. Permission denial, timeout, or unavailability leaves manual search operable. Only the most recently selected location is saved in `localStorage`; occasion, style, outfit choices, weather responses, and search text are not persisted. If storage is unavailable, the app continues for the current visit and explains only if the failure affects the User.

On a returning visit with a saved location, the app immediately displays that location and requests a fresh forecast for its saved coordinates. It does not persist or present an earlier forecast as current. The visible location remains available while loading, after success, and alongside any refresh error so the User knows which place the result concerns.

**Acceptance checks:** With storage empty, no weather request or permission prompt occurs before an explicit location action; with a saved location, its name is immediately visible and a fresh weather request begins without confirmation; city suggestions update as the User types after choosing a state and are fully keyboard operable; moving through suggestions does not submit one; city/state, duplicate city names, leading-zero ZIPs, at least one ZIP from every shard, Alaska, and Hawaii resolve to representative coordinates; a known unsupported special-purpose ZIP produces the defined explanation; denial of geolocation preserves manual search; and inspecting storage shows no persistent app data other than the latest location.

### 3. Character, style, occasion, and outfit controls

The illustrated character is the visual focus and assembles one valid outfit from modular SVG parts. Written text communicates the same advice, so understanding never depends on seeing the illustration.

Two labeled, visually consistent segmented controls appear together near the character:

- `Style`: Masculine, No preference, Feminine. No preference is the default and describes garment silhouette rather than gender identity.
- `Occasion`: Everyday, Game day, Birthday party. Everyday is the default. Game day uses burnt orange and white without asking for a school. Birthday party is casual-dressy rather than formal.

The controls remain active for the current visit but reset to their defaults after a new visit. They are not persisted. Weather suitability always takes priority over style or occasion.

Previous and next arrow buttons flank or sit above the character and have accessible names describing their action. For Masculine or Feminine, they cycle through the three valid variations for the current category and occasion. For No preference, they cycle through all six compatible variations across both style directions. Cycling changes only the outfit variation, not date, location, weather category, occasion, or reminders.

**Acceptance checks:** Every option is reachable and operable by keyboard and touch; the selected option is conveyed programmatically and without color alone; controls have comfortable phone touch targets; defaults reset on a new visit; the arrows wrap through exactly three or six outfits as applicable; and every rendered garment combination passes matrix and layering validation.

### 4. Responsive presentation

At phone widths, sections form one reading column; the location control and date strip precede the character; both segmented controls fit without horizontal page scrolling; recommendation content stacks below; and primary actions remain reachable and comfortable for one-handed use. Only intentionally scrollable forecast strips may scroll horizontally.

At laptop widths, the date strip spans the content area and the lower content uses the drawing's two-column composition: character and controls on the left, written recommendation, notices, and reminders on the right. The layout must make meaningful use of the larger viewport rather than enlarge the phone arrangement.

**Acceptance checks:** At 390 × 844 CSS pixels and 1440 × 1000 CSS pixels, content reflows without clipping or unintended page-level horizontal scrolling; the character remains prominent; text is readable at 200% zoom; and forecast strips, controls, and navigation remain operable.

### 5. Written recommendation, reminders, and notices

Written guidance is organized under three explicit headings: `Wear`, `Bring`, and `Weather notices`. `Wear` provides a concise outfit recommendation naming useful garment types and layers. `Bring` contains practical reminders and identifies the relevant time or period. Triggered reminder types are rain protection, wet-weather footwear, hydration, sun protection, wind preparation, and adaptable layering. Each type has at least three wording variants. `Weather notices` remains visually and semantically separate from ordinary reminders. Empty sections are either omitted while preserving heading order or use concise neutral text; they never leave an unexplained blank card.

The character may visually carry or appear beside a relevant object, such as an umbrella, but every reminder also appears as text with an accessible icon treatment.

Prominent `Weather notices` may describe forecast thunderstorms, freezing precipitation, snow, strong wind, or qualifying rain. They are derived from Open-Meteo forecast data and must not use `watch`, `warning`, `advisory`, or language implying official emergency monitoring. During thunderstorm or strong-wind conditions, ordinary umbrella advice is replaced with broader rain-protection or shelter language.

**Acceptance checks:** Wear, Bring, and Weather notices appear in a consistent order; no unexplained empty section is rendered; rule-focused test fixtures trigger and suppress each reminder at its boundary; timing is included; overlapping wind/rain conditions suppress ordinary umbrella language; every icon has an accessible text equivalent; and notices are consistently labeled as forecast-based rather than official alerts.

### 6. Loading, incomplete data, and errors

The relevant region communicates loading for initial weather, changed dates or locations, and lazy-loaded location indexes without removing the last usable result prematurely. Status updates are announced to assistive technology without unnecessarily moving focus.

The interface distinguishes no search result, unsupported ZIP, missing forecast fields, insufficient recommendation data, geolocation denial, network failure, provider error, rate limiting, and local-index loading failure. Recoverable errors provide a retry or alternate action. Missing values display as unavailable and are never converted to zero or favorable conditions.

When fewer than seven of the 13 recommendation-window hours contain usable apparent or air temperature, the outfit is visibly labeled `Limited forecast data`. The UI continues to show any trustworthy information that remains available.

**Acceptance checks:** Simulated delayed, null, partial, rejected, and rate-limited responses produce the correct state and recovery action; location-index failure retains device location as an option; geolocation denial retains manual search; and status changes are announced once without trapping focus.

### 7. Accessibility

The app uses semantic landmarks and headings, native buttons and form controls where possible, a logical focus order, visible focus indicators, descriptive labels, and programmatic status messages. All functionality is keyboard accessible. Information conveyed by color, icons, clothing, or character pose is repeated in text. Text uses high contrast against every background, and text, focus indicators, and meaningful graphical controls meet WCAG 2.2 AA contrast targets. Text can resize or reflow without loss of content or function. Decorative colors or illustrated backgrounds must not reduce the readability of overlaid or adjacent text.

The date strip exposes each date and its selected state; arrow buttons name the direction and effect; segmented controls expose their group labels and current choices; the information icon is named `About Cloud Closet`; and decorative SVG parts are hidden from assistive technology while the assembled outfit receives a concise text description.

**Acceptance checks:** Keyboard-only review reaches every action in a logical order; a screen reader can identify location, selected date, outfit description, forecast, notices, reminders, selector values, and status changes; measured text/background, focus-indicator, and meaningful graphical-control color pairs meet WCAG 2.2 AA contrast requirements in default, hover, focus, selected, disabled, loading, notice, and error states; automated checks find no unlabeled controls or obvious contrast failures; and 200% zoom remains usable.

### 8. Information, credits, and privacy screen

The information screen is one scrollable page with ordinary headings and all content visible. Its sections cover:

- creator credit: Ella Gault;
- recommendation method, six temperature bands, reminder triggers, limitations, and the distinction between product rules and official safety thresholds;
- Open-Meteo weather source, required attribution, modeled-data limitation, and non-commercial-use constraint;
- US Census Gazetteer place and ZCTA source, representative-coordinate limitation, and ZIP coverage limitation;
- privacy behavior: manual search stays local until coordinates are selected; selected coordinates are sent to Open-Meteo; Open-Meteo may log them under its terms; device location requires permission; only the latest location is stored on the device;
- forecast-based weather notices are not official emergency alerts;
- AI-use disclosure accurately describing assistance with research, planning, development, and any asset creation without attributing Developer decisions to AI;
- original artwork credit and licenses for any third-party assets actually used; and
- linked evidence and additional resources cited in `research.md`.

The page header provides a clear back control that returns to the main screen without losing current in-memory selections.

**Acceptance checks:** Every required disclosure and credit is present and linked where applicable; no claim contradicts actual storage or network behavior; all headings are visible without expanding controls; and returning preserves the current main-screen state.

### 9. Deployment and compatibility

The dependency-free app uses semantic HTML, CSS, original modular SVG, and native JavaScript modules. It is deployed from the app directory to a public GitHub Pages HTTPS URL through GitHub Actions. No secret or API key is committed or shipped to the browser.

**Acceptance checks:** The deployed URL loads over HTTPS in current Chrome, Safari, Firefox, and Edge; direct navigation and refresh work on both primary screens; Open-Meteo requests succeed from the deployed origin; device location can be requested from the secure context; and the repository contains no credentials.

### 10. Usability testing and revision

A working version is tested with three peers on relevant phone and/or laptop layouts. Notes record tasks, observations, accessibility or comprehension problems, and participant feedback without unnecessary personal information. At least one supported improvement is implemented and verified; changed intended behavior is recorded in this specification and implementation work is recorded in `plan.md`.

**Acceptance checks:** `plan.md` contains three testing records, a prioritized finding, the selected improvement and rationale, and evidence that the revised behavior works.

## Recommendation state and data flow

Weather retrieval is separated from normalization, recommendation rules, deterministic variation selection, shared state, and rendering. The provider response is normalized before any UI component consumes it. Location, local date, normalized forecast, style, occasion, and active outfit index produce one recommendation state that drives the character garments, weather and reminder icons, written recommendation, notices, and reminders.

The recommendation window contains the 13 local hourly intervals from 8:00 a.m. through 8:00 p.m. Apparent temperature is used when available; an isolated missing apparent temperature falls back to that hour's air temperature. At least seven usable hourly values are required for a normal-confidence outfit. The median of the usable values selects the main category:

| Category | Median temperature T in °F | Clothing direction |
| --- | --- | --- |
| Hot | T ≥ 85 | Lightweight clothing and minimal layers |
| Warm | 75 ≤ T < 85 | Short sleeves and breathable clothing |
| Temperate | 65 ≤ T < 75 | Light clothing with an optional layer |
| Cool | 50 ≤ T < 65 | Long sleeves and a jacket |
| Cold | 32 < T < 50 | Warmer layers and outerwear |
| Freezing | T ≤ 32 | Heavier outerwear, hat, and gloves |

If hourly values enter another category for at least two consecutive intervals, the main outfit remains unchanged and timed removable-layer guidance is added.

Other rules operate independently within the same window:

- Rain protection: any hour has precipitation probability ≥ 40%, or measurable precipitation when probability is unavailable.
- Wet-weather footwear: total precipitation ≥ 0.10 inches, or any freezing rain, sleet, or snow.
- Hydration: any hourly apparent temperature reaches 80°F; use air temperature only under the same isolated-value fallback.
- Sun protection: any hourly UV index reaches 3.
- Wind: any sustained wind reaches 25 mph or any gust reaches 30 mph.
- Forecast notices: qualifying thunderstorm, freezing precipitation, snow, strong wind, or rain conditions already defined by these rules.

The state also contains data quality, selected timing ranges, weather-code summary, active reminders, notice priority, and the deterministic variation keys. Rules never add hourly precipitation probabilities together and never present a maximum hourly probability as the chance of rain for the whole day.

Changing location or date rebuilds the state from live data. Changing style or occasion preserves the weather-derived portions but selects a compatible outfit. Outfit arrows change only the active outfit index. Every render reads from the resulting state rather than deriving independent conditions in individual components.

## Content variation

The outfit matrix contains three curated combinations for every temperature-category × occasion × Masculine/Feminine pairing: 6 × 3 × 2 × 3 = 108 outfit slots. No preference draws from the six compatible slots across both style directions and does not require a third wardrobe.

Each reminder type contains at least three meaning-equivalent wording variants. Outfit and reminder variants use separate deterministic pseudo-random selections so choosing or cycling an outfit cannot change reminder wording. Keys include the selected location, local date, relevant recommendation state, occasion, and style; reminder keys additionally include reminder type. The implementation must not use unstable array order or the current clock as a seed.

During the current page visit, returning to a previously viewed date restores its generated reminder variants and its last arrow-selected outfit. These choices are held only in memory. After reload or a new visit, the app deterministically recreates the initial variations for the same unchanged recommendation state but does not restore manual arrow choices. If refreshed forecast data changes the recommendation state, the variations may change appropriately. No variation choice is written to persistent storage.

**Acceptance checks:** Automated tests verify three distinct outfits for all 36 category/occasion/style combinations, six compatible choices for No preference, at least three wording variants per reminder, independence of outfit and reminder selection, stable in-visit return behavior, deterministic initialization, and no persistent variation data.

## Assets

All character, garment, weather, and reminder art is original modular SVG generated with ChatGPT under Ella Gault's direction. Ella edited selected pieces and reviewed the complete set for the final application. Her phone drawing guided a friendly editorial character with a simple expressive face, readable pose, and minimal detail that remains legible at small sizes. The core app uses one consistent base pose with interchangeable clothing and props. No third-party artwork is used. Shared alignment points and explicit SVG layer order prevent garments from overlapping incorrectly.

Working inventory:

| Asset group | Estimated count | Use and treatment |
| --- | ---: | --- |
| Base character and head overlay | 2 | Main recommendation and cross-browser top layer; original modular SVG |
| Tops | 12 | Outfit layers across categories, occasions, and style directions |
| Bottoms | 8 | Outfit layers |
| Dresses | 3 | Optional casual-dressy Birthday party variations |
| Outerwear | 8 | Temperature, rain, and wind layers |
| Footwear | 6 | General and weather-appropriate variations |
| Accessories | 5 | Hat, gloves, umbrella or comparable visual props |
| Weather icons | 9 | Date/hour forecast and condition summary |
| Reminder icons | 6 | Rain, footwear, hydration, sun, wind, and layering |

Total production inventory: 59 unique SVG assets. Recoloring, including burnt orange and white Game day treatments, does not create separate assets. Each garment is tagged for compatible categories, occasions, style directions, layer position, and relevant conditions. The 108 outfit entries reference these reusable modules.

ChatGPT-generated output was treated as a starting point rather than an automatic final asset. Ella reviewed the assets for visual consistency, usable SVG structure, clean geometry, alignment with the shared character anchor points, correct layer order, small-size legibility, and absence of copied trademarks or recognizable third-party artwork. She edited selected pieces before approving the production inventory. The information screen discloses this workflow and does not attribute the Developer's decisions or review to AI.

## Out of scope

- Air-quality integration, unless time permits after all core requirements pass.
- Multiple character poses; the core app uses one modular base pose, with additional poses considered only as a stretch goal.
- Official government watches, warnings, or advisories and real-time emergency monitoring.
- Personalized medical or safety advice and claims that an outfit or footwear guarantees safety.
- Street-address search, international location search, and guarantees that every USPS delivery ZIP is represented.
- User accounts, cloud synchronization, saved wardrobes, shopping, purchasing, social sharing, ratings, or user-uploaded clothing.
- Persisting style, occasion, manual outfit choice, forecast data, or anything other than the latest selected location.
- Separate outfits for every hour; the app provides one main daily outfit with timed adaptation guidance.
- Celsius selection for this US-focused prototype.
- Commercial or promotional deployment under Open-Meteo's free non-commercial terms.

## Revisions

After implementation or testing, record requirement changes and the evidence that prompted them. Update the screen drawings when a material layout or interaction changes.

- **October 5, 2026 — guidance-order clarification:** corrected the screen-design summary to match the already approved `Wear`, `Bring`, and `Weather notices` order used throughout the requirements and implementation plan. This is a consistency correction, not a behavior change.
- **October 5, 2026 — ZIP display labels:** after reviewing the implemented location flow, the Developer requested city context instead of a generic `ZIP code 78701` label. ZIP data generation now joins the official 2020 Census ZCTA-to-place relationship file and displays the named Census place with the largest land-area overlap, state, and ZIP when available. This remains a local lookup and is disclosed as representative Census geography rather than a USPS preferred-city guarantee.
- **October 3, 2026 — screen and interaction decisions:** added the four hand drawings; selected Cloud Closet as the prototype name; defined the matching Style and Occasion segmented controls; defined three-versus-six outfit cycling; chose session-only memory with deterministic initialization; placed location search above the forecast with `Use my location` inside the same control region; and placed an accessible information icon opposite the app name. The Developer approved these decisions during specification discussion.
- **October 3, 2026 — artwork workflow:** selected AI-assisted creation for the modular SVG character, garments, and icons because manually producing the full asset inventory is not feasible within the project schedule. The Developer's drawings direct the art style, and she may create or revise a smaller number of custom assets. All production assets remain subject to manual review, cleanup, compatibility checks, and accurate AI-use disclosure.
- **October 3, 2026 — character pose scope:** selected one consistent modular base pose for the core app. Additional poses are deferred as a stretch goal so required outfit coverage and garment alignment take priority.
- **October 3, 2026 — initial location state:** the app does not default to Austin. On a first visit without a saved location, it waits for the User to choose manual search or device location before requesting weather.
- **October 3, 2026 — returning location state:** a returning visit displays the saved location and automatically retrieves a fresh forecast for it. Forecast responses are not stored between visits, and the location remains visible during loading or errors.
- **October 3, 2026 — manual search interaction:** manual search uses a state selector and city-or-ZIP field. After state selection, accessible city suggestions appear while typing; exact five-digit ZIP lookup does not require a state.
- **October 3, 2026 — guidance hierarchy:** written output is grouped under consistent Wear, Bring, and Weather notices headings so clothing advice, preparation reminders, and forecast-based notices remain distinct.
- **October 3, 2026 — visual accessibility clarification:** made high text-to-background contrast explicit and required contrast verification across interactive and status states, including illustrated areas.

## Approval

**Approved by the Developer on October 3, 2026.** The approved specification includes the four linked screen drawings and the revisions recorded above. Stretch goals remain subordinate to the complete core requirements.

## Saving the transcript

After the Developer approves the specification, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
- **October 8, 2026 — completed SVG inventory and provenance:** completed and integrated the 58 planned production SVG assets. ChatGPT generated the artwork under Ella Gault's direction; Ella edited selected pieces and reviewed the full set. No third-party artwork is used.
- **October 8, 2026 — cross-browser head asset:** added one standalone head overlay with explicit SVG presentation attributes after Safari and Firefox rendered the previous external-fragment approach with black fallback fills. This brings the production inventory to 59 SVG assets without changing the approved visual design or outfit behavior.
