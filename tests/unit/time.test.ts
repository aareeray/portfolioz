import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatTimeInZone,
  timezoneLabel,
  currentYear,
} from "../../src/lib/time.ts";

const fixed = new Date("2026-01-15T12:00:00Z");

test("formatTimeInZone returns HH:MM", () => {
  const out = formatTimeInZone("UTC", fixed);
  assert.match(out, /^\d{2}:\d{2}$/);
  assert.equal(out, "12:00");
});

test("formatTimeInZone respects timezone offset", () => {
  // Asia/Ho_Chi_Minh is UTC+7 (no DST).
  assert.equal(formatTimeInZone("Asia/Ho_Chi_Minh", fixed), "19:00");
});

test("formatTimeInZone falls back on invalid tz", () => {
  const out = formatTimeInZone("Not/AZone", fixed);
  assert.match(out, /^\d{2}:\d{2}$/);
});

test("timezoneLabel returns a string", () => {
  const label = timezoneLabel("Asia/Ho_Chi_Minh", fixed);
  assert.equal(typeof label, "string");
  assert.ok(label.length > 0);
});

test("currentYear", () => {
  assert.equal(currentYear(fixed), 2026);
});
