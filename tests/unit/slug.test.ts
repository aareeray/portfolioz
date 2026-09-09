import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, isValidSlug, uniqueSlug } from "../../src/lib/slug.ts";

test("slugify basics", () => {
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("  Trim   Me  "), "trim-me");
  assert.equal(slugify("Special!@#Chars"), "special-chars");
  assert.equal(slugify("Multiple---Hyphens"), "multiple-hyphens");
});

test("slugify strips diacritics", () => {
  assert.equal(slugify("Café Déjà"), "cafe-deja");
});

test("isValidSlug", () => {
  assert.equal(isValidSlug("valid-slug-1"), true);
  assert.equal(isValidSlug("Invalid Slug"), false);
  assert.equal(isValidSlug("-leading"), false);
  assert.equal(isValidSlug(""), false);
});

test("uniqueSlug appends suffix on collision", () => {
  const existing = ["project", "project-2"];
  assert.equal(uniqueSlug("project", existing), "project-3");
  assert.equal(uniqueSlug("fresh", existing), "fresh");
});
