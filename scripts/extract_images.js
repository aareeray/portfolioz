import fs from "node:fs";

const text = fs.readFileSync(
  "C:/Users/letsm/.gemini/antigravity-ide/brain/f121367b-ed16-4039-b1a7-3ffec655a886/.system_generated/steps/106/content.md",
  "utf8"
);

const matches = [...text.matchAll(/https:\/\/framerusercontent\.com\/images\/[^"'\\s\\)]+/g)].map(m => m[0]);
console.log("Found images:", [...new Set(matches)]);
