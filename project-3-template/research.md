# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Research your context of use, references, weather guidance, technical options, and choices that will guide the specification.

## Instructions for the Developer

Judge sources and recommendations, make the consequential decisions, and keep this file current as the work develops.

To begin, open the project repository in a fresh chat and enter:

`Read ./research.md and help me begin Project 3 research.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, and this file. Ask one focused question at a time. Help investigate and compare options without deciding for the Developer. Verify sources directly and keep this file concise.

## Context of use

As the User, describe when and where you would use the app and what you need from it. Record important circumstances, assumptions, and limitations.

- I would check the app at my apartment in Austin, Texas, in the morning before getting ready and leaving around 9 a.m.
- I walk to two back-to-back classes in the same building, then have a 1-hour-45-minute break. I usually buy lunch on campus and eat outside when the weather is nice, then walk to another class at the bottom of a hill.
- My walk home takes about 20 minutes uphill. On Mondays I get home around 6:40 p.m. On Wednesdays I leave campus either after my last class at 3:30 p.m. or between 5 and 6 p.m. if I stay to work.
- My main concern is preparing for rain during the whole day away from home. Forgetting an umbrella leaves my clothes and shoes wet, and my shoes can slip on the campus's stone surfaces. Austin often feels hot to me, so comfort during outdoor walks also matters.
- Austin grounds my personal use case, but the app must support locations across the United States through manual entry and device location. My return time can vary, so the morning forecast needs to help me prepare for an uncertain schedule.

## User story

Write at least one user story grounded in your context of use:

> As a [type of user], I want to [need or goal], so that [reason or outcome].

Focus on the need rather than prescribing an interface or feature.

Approved user stories (needs beyond the personal context remain research hypotheses to investigate):

> As someone who walks around campus and may stay until evening, I want to prepare for rain before leaving home, so I can stay dry and choose footwear suited to wet campus paths throughout my day.

- **Other locations:** As someone planning a day in another US location, I want guidance for the weather there, so I can prepare for conditions that differ from those at home.
- **Accessibility:** As someone who uses a screen reader, I want to understand the forecast, clothing advice, and reminders without relying on the character illustration, so I can independently decide what to wear and bring.
- **Unfamiliar climate:** As someone unfamiliar with the local climate, I want to understand what the forecast means for clothing and rain protection, so I can prepare even when the temperature alone does not tell me what to expect.
- **Air quality:** As someone sensitive to poor air quality, I want to understand the air quality forecast for my location, so I can make informed decisions about when to spend time outdoors and whether to adjust my plans. **Scope note: integrating air-quality information is a stretch goal, not a core requirement of the brief.**

## References

Collect 5–10 reference images from relevant products and interfaces. Save each image in `reference/`, identify its source, and record a brief observation about what is useful, ineffective, or relevant to this project. Reference images are examples only; do not use them in the app.

Seven screenshots supplied in chat. The fourth source was confirmed by the Developer as WhetherWear. These original attachments are not saved locally; the separately captured reference set below provides eight local images. Observations are Agent proposals for Developer review, not selected design decisions.

| Screenshot | Source | Observation and project relevance |
| --- | --- | --- |
| 1. Phone forecast | [Apple Weather](https://support.apple.com/en-mo/guide/iphone/iph1ac0b35f/ios) | Large current conditions establish hierarchy; hourly and daily forecasts support planning ahead. Rain chances are visible in daily rows. |
| 2. Phone air quality and precipitation | [Apple Weather](https://support.apple.com/en-mo/guide/iphone/iph1ac0b35f/ios) | AQI number, category label, and explanation convey meaning beyond color. Some section labels appear faint; contrast needs measurement rather than visual assumptions. |
| 3. Phone character and weather | [Weather Fit](https://weatherfit.com/) | Full outfit is the focal point, with a compact weather summary above it and labeled navigation below. The detailed background may compete with the clothing. |
| 4. Laptop character and outfit advice | [WhetherWear](https://whetherwear.com/) | Side-by-side character and written advice use laptop width. Separate Wear and Bring sections distinguish clothing from reminders. The visible Limited weather data label acknowledges incomplete information. |
| 5. Laptop air quality | [AirNow](https://www.airnow.gov/) | Current AQI and forecast categories are separated, with text accompanying colors. The timestamp and named pollutant provide context. |
| 6. Phone clothing choices | [Weather Fit](https://weatherfit.com/) | Consistent character poses make clothing variations easy to compare; each option has a written name. Useful as an artwork reference without committing to a clothing selection feature. |
| 7. Laptop clothing forecast | [Clothes Forecast](https://www.clothesforecast.com/) | Dates and time periods are prominent, and outfit cards use horizontal space. The unlabeled droplet percentage is ambiguous; outfit photos do not clearly explain rain preparedness. |

The table above describes the supplied screenshots only.

**Saved browser captures — September 28, 2026.** Laptop viewport: 1440 × 1000; phone-width viewport: 390 × 844. Images show the visible viewport, not the whole page. Austin was selected using simulated coordinates for the clothing sites and the city URL for AirNow. Phone captures use a resized desktop browser, not a physical phone. These are design references, not validation of the sites' recommendation methods.

| Local image | Source | Observation and project relevance |
| --- | --- | --- |
| [Clothes Forecast — laptop](reference/clothes-forecast-laptop.png) | [Clothes Forecast](https://www.clothesforecast.com/) | Five outfit columns use available width within a centered content area. Dates and time-of-day controls appear before outfit advice. |
| [Clothes Forecast — phone](reference/clothes-forecast-phone.png) | [Clothes Forecast](https://www.clothesforecast.com/) | Outfit cards reflow into two columns. Location control shortens to Switch, and the written condition shown on laptop is absent from the weather strip. Compactness can reduce clarity. |
| [WhetherWear — laptop location dialog](reference/whetherwear-laptop.png) | [WhetherWear](https://whetherwear.com/) | Centered dialog offers both manual city selection and location access, with a visible focus outline. Useful reference for explaining why location is requested. |
| [WhetherWear — phone location dialog](reference/whetherwear-phone.png) | [WhetherWear](https://whetherwear.com/) | Location choices stack into wide buttons at phone width, preserving both options. |
| [WhetherWear — laptop forecast](reference/whetherwear-forecast-laptop.png) | [WhetherWear](https://whetherwear.com/) | Character and detailed written advice appear side by side. Wear and Bring summaries support quick reading; Limited weather data flags incomplete information. |
| [WhetherWear — phone forecast](reference/whetherwear-forecast-phone.png) | [WhetherWear](https://whetherwear.com/) | Character panel stacks above Wear and Bring summaries. Detailed clothing advice is below the visible area; the cookie banner takes a substantial part of the screen. |
| [AirNow — laptop](reference/airnow-laptop.png) | [AirNow Austin](https://www.airnow.gov/?city=Austin&state=TX) | Current AQI gauge and forecast sit side by side. Category words accompany colors, and the current reading includes a timestamp and pollutant. |
| [AirNow — phone](reference/airnow-phone.png) | [AirNow Austin](https://www.airnow.gov/?city=Austin&state=TX) | Current gauge, location search, and forecast stack vertically. Navigation condenses while current and forecast categories remain distinct. |

All eight saved images were visually inspected. Layout changes were observed at the two viewport sizes; screen-reader behavior, keyboard operation, touch usability, and measured contrast remain untested. Reference artwork must not be reused in the app.

## Weather and technical evidence

Record each useful source, what it supports, and important limitations. Research the weather variables, apparel guidance, reminders, accessibility, privacy, artwork, weather providers, and technical options needed for informed decisions.

**Initial evidence review — September 28, 2026.** Official documentation reviewed directly. Findings and proposals below await Developer review; no accounts were created and no live API integration has been tested.

**Free provider comparison**

| Provider and official sources | Relevant capabilities | Limits and project implications |
| --- | --- | --- |
| Open-Meteo — [pricing](https://open-meteo.com/en/pricing), [forecast docs](https://open-meteo.com/en/docs), [terms](https://open-meteo.com/en/terms) | No key for free access; global coverage including the US. Hourly temperature, apparent temperature, precipitation probability/amount, wind, and weather codes; daily summaries and UV. Seven forecast days by default, up to 16. | Free service is non-commercial: 600 calls/minute, 5,000/hour, 10,000/day; pricing also lists 300,000/month. Attribution required, no free uptime guarantee. Terms explicitly classify promotional activities as commercial. Candidate for an eligible independent demo, not automatically suitable for the brief's real brand campaign. Current conditions are modeled, not necessarily local station measurements. |
| National Weather Service — [API documentation](https://www.weather.gov/documentation/services-web-api) | Free for any purpose; forecasts, observations, and alerts. Coordinate lookup returns seven-day hourly and 12-hour forecast endpoints. | Undisclosed rate limits; application-identifying User-Agent required. Needs separate city search and observation lookup. The documented service is not a combined weather/AQI solution. Browser request behavior and geographic coverage at representative US locations need testing, including Alaska and Hawaii. |
| WeatherAPI — [pricing](https://www.weatherapi.com/pricing.aspx), [API documentation](https://www.weatherapi.com/docs/) | Free plan permits commercial use, offers 100,000 calls/month, current conditions, three forecast days with hourly/daily data, and location search. Covers US locations. | Account and API key required. Free AQI is listed only as Limited; usable forecast AQI entitlement remains unverified. Calls stop when the monthly allowance is exhausted. Proposed implementation: keep the key in a server-side proxy, adding deployment work. Its `us-epa-index` is a category code from 1–6, not a numerical AQI such as 67. |

Open-Meteo's [air-quality API](https://open-meteo.com/en/docs/air-quality-api) provides US AQI and pollutant forecasts through a separate endpoint. US coverage uses CAMS global data at approximately 45 km resolution, with a five-day underlying forecast; hourly output does not mean street-level measurement. Credit both CAMS and Open-Meteo. Its [geocoding API](https://open-meteo.com/en/docs/geocoding-api) supports `countryCode=US` filtering and returns coordinates and location metadata. Weather and AQI forecast horizons differ, so later dates must not silently reuse today's AQI.

**Weather variables and recommendation evidence**

**NWS air-quality follow-up:** NWS is the selected weather provider; air-quality integration is a stretch goal (see Decisions). Checked the live [NWS OpenAPI schema](https://api.weather.gov/openapi.json): no structured AQI, ozone, or particulate concentration fields/endpoints were found. Air-quality alerts, where issued, would not substitute for routine AQI readings or forecasts. [EPA AirNow web services](https://docs.airnowapi.org/webservices) provide separate current AQI observations and forecasts by location. The [AirNow FAQ](https://docs.airnowapi.org/faq) documents API keys, endpoint-specific rate limits, generally hourly observations and daily forecasts. Forecast coverage varies by reporting area: one to six days, sometimes seasonal, and sometimes category-only. The service list flags older endpoints for retirement in fall 2026; use the replacement endpoints if selected. A backend/proxy and current browser-access checks remain to be investigated. If the stretch goal is pursued, AirNow remains a candidate supplementary service, with explicit unavailable states. AirNow integration is not approved for the core scope.

| Source | What it supports | Proposed application and limitation |
| --- | --- | --- |
| [NWS precipitation probability explanation](https://www.weather.gov/ffc/pop) | Probability concerns measurable precipitation at a forecast point during a stated interval. It does not describe how much of the day will be rainy. | Show the interval with rain chance; consider hourly forecasts across the time away from home. An umbrella cutoff is a product decision to test, not an official threshold. Do not add hourly probabilities together or label their maximum as the probability of rain over the whole day. |
| [NWS heat guidance](https://www.weather.gov/safety/heat-during) | Lightweight, loose clothing, reduced sun exposure, and hydration help people prepare for heat. | Supports lightweight outfit categories and water/shade reminders. Exact clothing temperature bands remain design assumptions; activity and personal comfort vary. Avoid fixed water quantities or guarantees of safety. |
| [EPA UV index guidance](https://www.epa.gov/sunsafety/uv-index-scale-0) | Sun protection is advised at UV index 3 and above, including shade, protective clothing, hat, sunglasses, and sunscreen. | Candidate trigger for a sun-protection reminder. UV should be checked independently of temperature or a cloudy icon. Final reminder wording remains to be chosen. |
| [AirNow AQI basics](https://www.airnow.gov/aqi/aqi-basics/) | US AQI categories include Good (0–50), Moderate (51–100), and Unhealthy for Sensitive Groups (101–150), with higher categories above that. Sensitivity matters. | Pair AQI values with category words and time context. Missing AQI must mean unavailable, not Good. AQI categories support explanations but do not constitute personalized medical advice. |

Proposed data needs: current conditions plus hourly temperature/apparent temperature, precipitation probability and amount, weather codes, wind, UV, and—if supported—US AQI. Use the selected location's time zone when grouping dates. Show data time and distinguish current conditions from forecasts. Wet-path footwear guidance, cold-weather clothing, and final category boundaries still need evidence; do not claim footwear prevents slips.

**Technical and accessibility evidence**

- [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): Pages serves static HTML, CSS, and JavaScript. Inference: a keyless API is simpler for this deployment; a secret-key provider needs a separately hosted backend/proxy to keep its key out of browser code. A build-time environment variable embedded in JavaScript does not hide a key. Framework choice is still open.
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API): device location requires a secure context and user permission. Proposal: request it after an explicit action and keep manual city entry available for denial, timeout, or unavailable location.
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): storage persists across browser sessions but may be blocked. Proposal: persist only the latest location, replace it on change, and continue without persistence if storage fails. Location queries still go to the provider; local storage does not mean location never leaves the device. Open-Meteo's [privacy terms](https://open-meteo.com/en/terms) say logs may include coordinates and are deleted after 90 days.
- [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/): supports text alternatives (1.1.1), information beyond color (1.4.1), text contrast (1.4.3), reflow (1.4.10), keyboard access (2.1.1), visible focus (2.4.7), and status messages (4.1.3). Proposal: readable outfit/reminder text alongside the character, labeled controls, keyboard date selection, and accessible loading/error updates. Reference screenshots alone establish none of these behaviors.
- Proposed app structure: normalize the provider response into one recommendation state, then derive character clothing, icons, text, and reminders from it. Choose outfit/reminder variants independently and retain selections when returning to a date. Keep transient selections in memory so persistent storage remains limited to the latest location. These are implementation proposals grounded in the brief, not API features.

**Next decisions and checks:** choose the supported NWS forecast range and location-search approach; test browser requests, null fields, date boundaries, rate-limit errors, and denied location. Artwork approach and asset estimate follow category selection and must account for the approved occasion styles. AirNow access and deployment checks are deferred unless the air-quality stretch goal is pursued.

## Decisions

- **Cost:** use free weather providers.
- **Weather provider — approved:** National Weather Service (NWS), selected by the Developer. It provides free US weather data; location search and browser integration still need verification.
- **Air quality — stretch goal:** integrating air-quality information is optional and outside the core scope. AirNow remains a possible source if this goal is pursued. Core weather and clothing recommendations must work independently of air-quality integration.
- **Additional feature — approved: occasion selector.** Everyday uses regular campus clothing; Game day uses burnt orange and white, with no school or color selector; Birthday party uses slightly dressier clothing. Occasion changes outfit style, while weather continues to determine suitable layers, rain protection, and reminders. Occasion alone does not imply indoor or outdoor exposure.
- **Feature rationale and trade-off:** the WhetherWear reference demonstrates activity/style selection alongside weather advice. The Developer identified personal expression and campus social occasions as a useful direction, choosing these three styles. Their value for other users remains to be tested with peers. Reusing the character and garment components may reduce artwork, but the asset estimate must account for occasion styles and the brief's three outfit variations per recommendation category.
- **Recommendation categories — approved:** Hot, Warm, Temperate, Cool, Cold, and Freezing. Freezing adds coverage for lower temperatures across US locations rather than grouping them with all conditions below 50°F.
- **Initial outfit estimate:** six weather categories × three occasions × three variations = **54 outfit combinations**, nine more than the five-category estimate. This assumes three variations for every category/occasion pairing. Combinations need not be separate illustrations: a shared character, reusable garments, and recoloring may reduce production work. Artwork approach and the unique asset count remain undecided; weather and reminder icons also need an estimate.
- **Still open:** forecast range, final temperature rules, implementation choices, occasion-selector presentation, specific dressier garments, and the complete artwork estimate. Category and occasion selections are approved; the overall research is not yet approved.

Provisional temperature bands for review and testing (design assumptions, not safety thresholds):

| Category | Temperature T in °F | Proposed clothing direction |
| --- | --- | --- |
| Hot | T ≥ 85 | Lightweight clothing, minimal layers |
| Warm | 75 ≤ T < 85 | Short sleeves, breathable clothing |
| Temperate | 65 ≤ T < 75 | Light clothing with an optional layer |
| Cool | 50 ≤ T < 65 | Long sleeves and a jacket |
| Cold | 32 < T < 50 | Warmer layers and outerwear |
| Freezing | T ≤ 32 | Heavier outerwear, hat, and gloves |

Temperature input (air temperature or an available feels-like measure) and how to summarize the selected day's forecast remain to be decided. Rain and wind should modify recommendations independently of the temperature category. Freezing is a clothing category, not a guarantee that a particular outfit is sufficient for all extreme cold conditions; detailed cold-weather guidance still needs research.

Record the selected weather provider, forecast range, recommendation categories and rules, screen structure, visual direction, artwork approach (original, AI-generated, or appropriately licensed), deployment method, and one additional feature justified by the research. Briefly explain important trade-offs.

Once the recommendation categories are chosen, estimate the art needed: the character, three outfit variations per category, weather icons, and reminder icons. Use that estimate to choose the artwork approach.

## Revisions

Record new evidence or changed decisions and explain why they changed.

## Approval

The Developer reviews the sources and decisions, corrects this file, and explicitly approves it before specification begins.

## Saving the transcript

After the Developer approves the research, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
