import fs from "node:fs";
import path from "node:path";

const homeImgs = JSON.parse(fs.readFileSync("scripts/home_images.json", "utf8"));
const cardImgs = homeImgs.slice(2); // skip logo and og image
const destDir = path.resolve("public/media/cards");
fs.mkdirSync(destDir, { recursive: true });

async function run() {
  const cardPaths = [];
  for (let i = 0; i < cardImgs.length; i++) {
    const url = cardImgs[i];
    const ext = path.extname(url) || ".jpg";
    const dest = path.join(destDir, `card_${i + 1}${ext}`);
    const localRel = `/media/cards/card_${i + 1}${ext}`;
    cardPaths.push(localRel);
    
    if (!fs.existsSync(dest)) {
      try {
        const res = await fetch(url);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        console.log(`Saved card_${i + 1}${ext}`);
      } catch (e) {
        console.error(`Error card_${i + 1}:`, e.message);
      }
    }
  }

  // Also save logo and og image
  const logoRes = await fetch(homeImgs[0]);
  fs.writeFileSync("public/media/huyml_logo.svg", Buffer.from(await logoRes.arrayBuffer()));
  const ogRes = await fetch(homeImgs[1]);
  fs.writeFileSync("public/media/huyml_og.png", Buffer.from(await ogRes.arrayBuffer()));
  console.log("Saved logo and og image");

  fs.writeFileSync("scripts/card_paths.json", JSON.stringify(cardPaths, null, 2));
  console.log("All 19 card images saved!");
}

run();
