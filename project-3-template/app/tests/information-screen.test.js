import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("information screen contains every required visible disclosure", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const about = html.slice(html.indexOf('data-route="about"'));

  for (const id of ["method-title", "reminders-title", "data-title", "privacy-title", "credits-title", "evidence-title"]) {
    assert.match(about, new RegExp(`id=["']${id}["']`), id);
  }

  for (const category of ["Hot", "Warm", "Temperate", "Cool", "Cold", "Freezing"]) {
    assert.match(about, new RegExp(`>${category}<`), category);
  }

  assert.match(about, /not official watches, warnings, advisories, or emergency alerts/i);
  assert.match(about, /non-commercial use/i);
  assert.match(about, /modeled estimates/i);
  assert.match(about, /deleted after 90 days/i);
  assert.match(about, /stores only the latest selected location/i);
  assert.match(about, /No third-party artwork is used/i);
  assert.match(about, /ChatGPT assisted with research synthesis, planning, writing, software development, testing, and SVG generation/i);
  assert.doesNotMatch(about, /will be added/i);
});

test("information navigation uses the existing hash route without resetting app state", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../scripts/app.js", import.meta.url), "utf8");

  assert.match(html, /class="back-link" href="#\/"/);
  assert.match(html, /href="#\/about"/);
  assert.equal((app.match(/createInitialState\(\)/g) ?? []).length, 1);
  assert.match(app, /window\.addEventListener\("hashchange", \(\) => updateRoute\(\{ moveFocus: true \}\)\)/);
});
