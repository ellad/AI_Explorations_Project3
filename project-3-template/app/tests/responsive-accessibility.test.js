import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const [red, green, blue] = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first, second) {
  const values = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("core text, focus, error, disabled, and control colors meet specified contrast", () => {
  const white = "#ffffff";
  const paper = "#fffaf1";
  const soft = "#f5dfc8";

  assert.ok(contrast("#24211f", paper) >= 4.5, "body text");
  assert.ok(contrast("#625b55", white) >= 4.5, "muted text");
  assert.ok(contrast("#b84419", white) >= 4.5, "primary button");
  assert.ok(contrast("#7b290c", soft) >= 4.5, "selected and accent text");
  assert.ok(contrast("#9d2100", white) >= 4.5, "error text");
  assert.ok(contrast("#ffffff", "#6f6863") >= 4.5, "disabled button text");
  assert.ok(contrast("#075e91", white) >= 3, "focus indicator");
  assert.ok(contrast("#766e68", white) >= 3, "control boundaries");
});

test("responsive rules preserve the approved phone and laptop compositions", async () => {
  const css = await readFile(new URL("../styles/main.css", import.meta.url), "utf8");

  assert.match(css, /width:\s*min\(100% - 2rem, var\(--content-width\)\)/);
  assert.match(css, /\.forecast-strip[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /\.hourly-strip[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width: 51\.99rem\)[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(min-width: 52rem\)[\s\S]*?\.recommendation-layout[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.location-actions \.button[\s\S]*?width:\s*100%/);
  assert.match(css, /min-height:\s*2\.75rem/);
  assert.match(css, /\.segmented-control label:has\(input:focus-visible\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("route changes move focus to the visible screen without resetting state", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../scripts/app.js", import.meta.url), "utf8");

  assert.match(html, /id="home-title" class="visually-hidden" tabindex="-1"/);
  assert.match(html, /id="about-title" tabindex="-1"/);
  assert.match(app, /hashchange[\s\S]*?moveFocus: true/);
  assert.match(app, /#about-title[\s\S]*?#home-title[\s\S]*?\.focus\(\)/);
  assert.equal((app.match(/createInitialState\(\)/g) ?? []).length, 1);
});
