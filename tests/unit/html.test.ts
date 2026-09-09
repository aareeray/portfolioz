import { test } from "node:test";
import assert from "node:assert/strict";
import { html, raw, escapeHtml, classes } from "../../src/lib/html.ts";

test("escapeHtml escapes dangerous characters", () => {
  assert.equal(escapeHtml("<script>\"&'"), "&lt;script&gt;&quot;&amp;&#39;");
});

test("html tag escapes interpolated values (XSS-safe)", () => {
  const evil = "<img src=x onerror=alert(1)>";
  const out = html`<p>${evil}</p>`.value;
  assert.ok(!out.includes("<img"));
  assert.ok(out.includes("&lt;img"));
});

test("raw() is not re-escaped and nests", () => {
  const inner = html`<b>${"<safe>"}</b>`;
  const out = html`<div>${inner}</div>`.value;
  assert.ok(out.includes("<b>&lt;safe&gt;</b>"));
  assert.equal(raw("<hr>").value, "<hr>");
});

test("arrays render joined", () => {
  const out = html`${["a", "b", "c"].map((x) => html`<li>${x}</li>`)}`.value;
  assert.equal(out, "<li>a</li><li>b</li><li>c</li>");
});

test("classes filters falsey", () => {
  assert.equal(classes("a", false, null, undefined, "b"), "a b");
});
