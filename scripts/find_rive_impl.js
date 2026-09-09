import fs from "node:fs";

async function run() {
  const res = await fetch("https://huyml.co/");
  const html = await res.text();
  const jsChunks = [...html.matchAll(/https:\/\/framerusercontent\.com\/sites\/4CUEbC1Vb07LtNCTtfjk6i\/[a-zA-Z0-9_\-\.]+\.mjs/g)].map(x => x[0]);
  
  for (const chunk of jsChunks) {
    const cRes = await fetch(chunk);
    const cText = await cRes.text();
    if (cText.includes("I7sDqjqViJfFWtj8WbkQgjeYP8.riv")) {
      console.log("Chunk with rive:", chunk);
      // find surrounding code
      const idx = cText.indexOf("I7sDqjqViJfFWtj8WbkQgjeYP8.riv");
      console.log("Context:\n", cText.substring(Math.max(0, idx - 400), Math.min(cText.length, idx + 400)));
    }
  }
}

run();
