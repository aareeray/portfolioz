import { test } from "node:test";
import assert from "node:assert/strict";
import { v } from "../../src/lib/validation.ts";

test("string min/max", () => {
  const s = v.string().min(2).max(5);
  assert.equal(s.parse("ab").success, true);
  assert.equal(s.parse("a").success, false);
  assert.equal(s.parse("abcdef").success, false);
});

test("string trims by default", () => {
  const res = v.string().min(1).parse("  hi  ");
  assert.equal(res.success, true);
  if (res.success) assert.equal(res.data, "hi");
});

test("email validation", () => {
  assert.equal(v.string().email().parse("a@b.co").success, true);
  assert.equal(v.string().email().parse("not-an-email").success, false);
});

test("optional treats empty as undefined", () => {
  const res = v.string().min(3).optional().parse("");
  assert.equal(res.success, true);
  if (res.success) assert.equal(res.data, undefined);
});

test("object collects issues by path", () => {
  const schema = v.object({
    name: v.string().min(2),
    email: v.string().email(),
    message: v.string().min(10),
  });
  const res = schema.parse({ name: "J", email: "bad", message: "short" });
  assert.equal(res.success, false);
  if (!res.success) {
    const paths = res.issues.map((i) => i.path).sort();
    assert.deepEqual(paths, ["email", "message", "name"]);
  }
});

test("object passes valid input", () => {
  const schema = v.object({
    name: v.string().min(2),
    age: v.number().int().min(0),
  });
  const res = schema.parse({ name: "Ada", age: "30" });
  assert.equal(res.success, true);
  if (res.success) assert.equal(res.data.age, 30);
});

test("enum validation", () => {
  const e = v.enum(["a", "b", "c"] as const);
  assert.equal(e.parse("b").success, true);
  assert.equal(e.parse("z").success, false);
});
