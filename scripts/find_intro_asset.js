import fs from "node:fs";

async function run() {
  const res = await fetch("https://huyml.co/");
  const html = await res.text();
  
  // Find all assets in html
  const assets = [...html.matchAll(/https:\/\/framerusercontent\.com\/[a-zA-Z0-9_\-\.\/]+/g)].map(x => x[0]);
  const unique = [...new Set(assets)];
  
  const rive = unique.filter(u => u.endsWith(".riv") || u.includes("rive"));
  const svgs = unique.filter(u => u.endsWith(".svg"));
  const imgs = unique.filter(u => u.endsWith(".png") || u.endsWith(".webp") || u.endsWith(".jpg"));
  
  console.log("Rive files:", rive);
  console.log("SVGs:", svgs);
  console.log("Images (total " + imgs.length + "):", imgs.slice(0, 20));
  
  // Also search inside framer JS chunks
  const jsChunks = [...html.matchAll(/https:\/\/framerusercontent\.com\/sites\/4CUEbC1Vb07LtNCTtfjk6i\/[a-zA-Z0-9_\-\.]+\.mjs/g)].map(x => x[0]);
  console.log("Found JS chunks:", jsChunks.length);
  for (const chunk of jsChunks) {
    try {
      const cRes = await fetch(chunk);
      const cText = await cRes.text();
      const riv = [...cText.matchAll(/https:\/\/framerusercontent\.com\/assets\/[a-zA-Z0-9_\-]+\.riv/g)].map(x => x[0]);
      if (riv.length) console.log("Found .riv in chunk:", riv);
      const sv = [...cText.matchAll(/https:\/\/framerusercontent\.com\/images\/[a-zA-Z0-9_\-]+\.svg/g)].map(x => x[0]);
      if (sv.length) console.log("Found svg in chunk:", sv);
      const pn = [...cText.matchAll(/https:\/\/framerusercontent\.com\/images\/[a-zA-Z0-9_\-]+\.(?:png|webp)/g)].map(x => x[0]);
      if (pn.length) console.log("Found png/webp in chunk:", pn);
    } catch (e) {}
  }
}

run();
