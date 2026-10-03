# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into an ordered, trackable build and verification plan.

## Instructions for the Developer

Set priorities, review the checklist, verify results rather than relying only on the Agent's report, and keep the project documents current as the work changes. Expect the build to take many rounds of testing and fixing; record material changes under Revisions.

To begin planning, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me create the Project 3 implementation plan.`

After approving the plan, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me implement the approved Project 3 plan in working checkpoints.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, `spec.md`, and this file, then inspect the relevant project files. Propose concrete tasks and checks without expanding the approved scope.

During implementation, follow the approved plan in working checkpoints and keep it current. Never mark approvals or items requiring Developer verification complete on the Developer's behalf.

## Approach

Build Cloud Closet in working checkpoints ordered by dependency and risk. Establish the dependency-free app shell and test setup first. Prepare location data before weather integration because every forecast request requires representative coordinates. Normalize Open-Meteo responses before applying recommendation rules so provider-specific data does not spread into the interface. Build and test the recommendation state, deterministic variation system, and outfit matrix before connecting them to the completed visual presentation. Every visible output—the character, outfit description, forecast icons, reminders, and notices—will render from that one state.

Begin Census data preparation and modular SVG production early because they are the largest schedule risks. The SVG system will use one base character, shared alignment points, explicit layer order, and reusable garment modules referenced by the 108-slot outfit matrix. Semantic HTML and accessible native controls will be used from the start; focused responsive and accessibility audits will follow once the complete interaction flow is available.

Each numbered checkpoint should end in a runnable result, relevant automated and manual checks, fixes for failures, and a meaningful commit. Deploy the verified app before peer testing so usability sessions exercise the real HTTPS version. Record material changes here, and update `spec.md` if testing changes the intended behavior.

The main dependency chain is:

`location selection → normalized forecast → recommendation state → deterministic variations and outfit matrix → rendering → deployed usability testing`

Main risks are the approximately 58 original SVG assets and 108 validated outfit slots; reproducible Census processing and runtime file size; local-time and partial-forecast behavior; accessible autocomplete focus and keyboard behavior; and cross-browser or real-device differences that automated tests cannot establish alone.

## Checklist

### Approvals

- [x] Research approved
- [x] Specification approved
- [x] Plan approved

### Build

- [ ] **Checkpoint 1 — Foundation:** Create the dependency-free app shell, semantic main and information screen structure, shared CSS foundation, native JavaScript module structure, Node test setup, and GitHub Pages workflow. Verify both screens load locally, direct navigation has a defined strategy, and the initial automated test command passes.
- [ ] **Checkpoint 2 — Location datasets:** Acquire the current US Census place and ZCTA Gazetteer files, record their source versions, and add a reproducible conversion process that produces state-based city files and ten first-digit ZIP shards. Validate duplicate city names, representative states, leading-zero ZIPs, one ZIP from every shard, Alaska, Hawaii, and a known unsupported special-purpose ZIP. Check generated files for correct string ZIP values and reasonable runtime size.
- [ ] **Checkpoint 3 — Location selection:** Implement the first-visit location empty state, state selector, accessible city suggestions, exact ZIP lookup, explicit `Use my location` action, and latest-location-only storage. Verify pointer and keyboard suggestion selection, focus movement without submission, saved-location return behavior, geolocation denial and timeout, index-loading states, retry or alternate actions, and storage contents.
- [ ] **Checkpoint 4 — Weather data:** Implement Open-Meteo request construction and response normalization for US customary units, selected-location local time, current conditions, and seven days of hourly data. Add fixtures for successful, delayed, null, partial, rejected, provider-error, and rate-limited responses. Verify continental US, Alaska, and Hawaii coordinates; exactly seven local dates; missing values preserved as unavailable; and no forecast request before first-time location selection.
- [ ] **Checkpoint 5 — Recommendation engine:** Implement and unit-test the 8:00 a.m.–8:00 p.m. recommendation window, apparent-temperature fallback, median category, limited-data threshold, timed layering, rain protection, wet-weather footwear, hydration, sun protection, wind preparation, forecast notices, timing ranges, and umbrella suppression. Test every rule immediately below, at, and above its boundary and test overlapping conditions.
- [ ] **Checkpoint 6 — Variations and outfit matrix:** Define three valid outfits for all 36 category × occasion × Masculine/Feminine combinations, producing 108 slots and six compatible No preference options. Implement stable deterministic seeds, separately keyed reminder wording, arrow wrapping, and in-memory per-date outfit history. Automate checks for matrix coverage, garment and layer compatibility, distinct variations, reminder independence, deterministic initialization, stable date return, and absence of persisted variation data.
- [ ] **Checkpoint 7 — Original SVG assets:** Create and review the modular base character, garments, outerwear, footwear, accessories, weather icons, and reminder icons listed in `spec.md`, starting concept and production work as early checkpoints proceed. Use shared anchor points and explicit SVG layer order. Review every production asset for visual consistency, editable structure, clean geometry, small-size legibility, compatibility, accessible treatment, and absence of trademarks or unlicensed copied material; update the inventory and credits to match what is actually used.
- [ ] **Checkpoint 8 — Main screen:** Use the approved phone and laptop drawings to implement location controls, seven-day date strip, horizontally scrollable hourly strip, character and outfit arrows, Style and Occasion segmented controls, and the ordered Wear, Bring, and Weather notices regions. Connect every visual and written output to the one shared recommendation state. Verify date, location, style, occasion, and arrow changes affect only their specified state; today initially scrolls to the current local hour while earlier hours remain reachable.
- [ ] **Checkpoint 9 — Information screen:** Implement the visible, non-accordion information sections and clear back control. Include the final recommendation method, six temperature bands, reminder rules and limitations, Open-Meteo and Census attribution, privacy and storage behavior, forecast-notice limitation, creator credit, accurate AI-use disclosure, artwork credits, licenses, and research links. Verify returning to the main screen preserves all current in-memory selections.
- [ ] **Checkpoint 10 — Responsive and accessible presentation:** Complete the phone single-column and laptop two-column compositions while retaining the approved content order and character emphasis. Verify 390 × 844 and 1440 × 1000 CSS-pixel layouts, no unintended page-level horizontal scrolling, comfortable one-handed targets, keyboard operation, logical focus order, native control semantics, visible focus, status announcements, accessible SVG descriptions, 200% zoom, and WCAG 2.2 AA contrast across all interactive and status states.
- [ ] **Checkpoint 11 — Integrated local verification:** Check every specification requirement against the assembled app. Test multiple locations, all seven dates, all recommendation categories, every occasion and style, outfit and reminder variation behavior, current and forecast labels, loading and recovery states, storage and network behavior, and incomplete data. Run the full automated suite and fix failures before deployment.
- [ ] **Checkpoint 12 — Deployment verification:** Deploy only the app directory through GitHub Actions to a public GitHub Pages HTTPS URL. Verify direct navigation and refresh, production module and data paths, Open-Meteo requests, secure-context geolocation, and absence of credentials. Independently test the deployed version in current Chrome, Safari, Firefox, and Edge on a real phone and laptop.
- [ ] **Checkpoint 13 — Usability revision:** Prepare and conduct the three peer sessions described below against the working deployed app. Record observations separately from interpretations, identify and prioritize the strongest supported finding, choose at least one meaningful improvement, add it to this checklist, update `spec.md` if intended behavior changes, implement it, verify it locally and on the deployed site, and redeploy.
- [ ] **Checkpoint 14 — Delivery audit:** Confirm all brief deliverables, required sources, privacy statements, artwork and AI-use credits, asset licenses, and transcript records. Audit the repository for credentials, confirm final automated and manual checks, and prepare the debrief.
- [ ] Test and fix each checkpoint against the specification before starting the next.
- [ ] Commit each meaningful working checkpoint.

### Verify and revise

- [ ] Check every specification requirement
- [ ] Test multiple locations, current and forecast dates, recommendation categories, outfit and reminder variations, and failure states
- [ ] Verify that eligible outfit and reminder variations are selected independently rather than as fixed pairs
- [ ] Verify that returning to a previously selected date shows the same variations
- [ ] Test the deployed app, independently of the local version, on a real phone and a laptop, including both screens, accessibility, and one-handed controls
- [ ] Prepare the usability test below
- [ ] Test with three peers and record each session
- [ ] Add the chosen improvement to this checklist, and update `spec.md` if the intended result changes
- [ ] Implement, verify, and redeploy at least one meaningful revision

### Deliver

- [ ] Confirm all brief deliverables, sources, privacy information, and asset credits
- [ ] Save all chat transcripts
- [ ] Complete the debrief

## Usability testing

Conduct the sessions after the working app is deployed so participants test the real HTTPS version, including its production data paths and device behavior. Before the first session, confirm the final URL and test setup against the implemented app, then mark `Prepare the usability test below` complete.

### Purpose

Determine whether Users can select a US location, understand the forecast-based outfit and time-specific preparation guidance, explore dates and outfit preferences, and find the app's methods, limitations, and privacy information. Look for comprehension, accessibility, and one-handed-use barriers without treating participant preferences as automatic requirements.

### Participants and setup

- Test with three peers identified only as P1, P2, and P3; do not record unnecessary personal information.
- Include relevant phone and laptop use, with at least one session on each layout. Record the device, browser, viewport or orientation, and input method.
- Use the deployed HTTPS app. Record whether the session starts with cleared storage or a saved location so first-visit and returning behavior are not confused.
- Ask permission before recording a session. If permission is not given, take written notes instead.
- Use the same introduction and core tasks in each session. Do not demonstrate the interface before testing.

### Introduction

> This is a prototype that recommends what to wear and bring based on a live weather forecast. I am testing the app, not you. Please work through the tasks in your own way and say what you are thinking when you can. I may wait before answering questions so I can see what the interface communicates on its own.

### Core tasks

1. Choose a US location and find today's clothing recommendation.
2. Decide whether you need rain protection or different footwear later in the day, and explain what led you to that conclusion.
3. Check the recommendation for a future date, then return to the original date.
4. Change the Style and Occasion settings and view another compatible outfit without changing the forecast date.
5. Find how the recommendations are calculated, whether the weather notices are official alerts, and what location information the app stores or sends.

If live weather does not naturally trigger rain or another important reminder, provide a prepared location/date or fixture that exercises the relevant guidance, and record that intervention.

### Non-leading prompts

- “What would you do next?”
- “What do you think this means?”
- “What information are you using to make that decision?”
- “What, if anything, did you expect to happen?”
- “Is there anything here you would want explained differently?”

Do not name or point to the intended control unless the participant has stopped attempting the task; record any assistance as part of the observation.

### Evidence to record

For each task, record whether it was completed without assistance, completed with assistance, or not completed. Note the participant's observable actions and words; comprehension of `Wear`, `Bring`, and `Weather notices`; ability to recover from confusion; keyboard, touch, screen-reader, or one-handed-use barriers; and questions or expectations. Keep observations separate from interpretations and possible changes.

### Session records

#### P1

- Date and test format:
- Device, browser, viewport/orientation, and input method:
- Starting storage/location state:
- Recording permission and note method:
- Task-by-task observations and quotations:
- Successes:
- Barriers or questions:
- Assistance provided:
- Researcher interpretation:
- Possible changes:

#### P2

- Date and test format:
- Device, browser, viewport/orientation, and input method:
- Starting storage/location state:
- Recording permission and note method:
- Task-by-task observations and quotations:
- Successes:
- Barriers or questions:
- Assistance provided:
- Researcher interpretation:
- Possible changes:

#### P3

- Date and test format:
- Device, browser, viewport/orientation, and input method:
- Starting storage/location state:
- Recording permission and note method:
- Task-by-task observations and quotations:
- Successes:
- Barriers or questions:
- Assistance provided:
- Researcher interpretation:
- Possible changes:

### Findings and revision

After all three sessions, group repeated or high-impact findings without erasing meaningful differences between participants. Prioritize findings by their effect on task completion, comprehension, accessibility, and recovery, then by how often they occurred. Record the strongest findings, select at least one meaningful improvement supported by the evidence, and explain the choice. Add the improvement to the Build checklist, update `spec.md` if intended behavior changes, implement it, verify it locally and on the deployed app, and record the result below.

- Strongest findings:
- Prioritized finding:
- Selected improvement and rationale:
- Specification change, if any:
- Verification evidence:
- Redeployment result:

## Revisions

- **October 3, 2026 — initial implementation plan approved:** organized the build into 14 dependency- and risk-ordered checkpoints, with location data and modular SVG work started early; one shared recommendation state driving all output; verification required at every checkpoint; deployment before peer testing; and a consistent usability-test protocol with three non-identifying session records. The Developer approved this plan during planning discussion.

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
