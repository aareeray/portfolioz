import fs from "node:fs";

async function run() {
  const res = await fetch("https://huyml.co/");
  const html = await res.text();
  const imgs = [...html.matchAll(/https:\/\/framerusercontent\.com\/images\/[a-zA-Z0-9_\-]+\.(?:png|jpg|jpeg|webp|svg)/g)].map(x => x[0]);
  const unique = [...new Set(imgs)];
  console.log("Homepage images:", unique);
  fs.writeFileSync("scripts/home_images.json", JSON.stringify(unique, null, 2));
}

run();
