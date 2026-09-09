import fs from "node:fs";
import path from "node:path";

const projectImages = JSON.parse(fs.readFileSync("scripts/project_images.json", "utf8"));
const targetDir = path.resolve("public/media/projects");
fs.mkdirSync(targetDir, { recursive: true });

async function download(url, dest) {
  if (fs.existsSync(dest)) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`Saved: ${path.basename(dest)}`);
  } catch (e) {
    console.error(`Failed to download ${url}: ${e.message}`);
  }
}

async function run() {
  const localMap = {};

  for (const [slug, urls] of Object.entries(projectImages)) {
    localMap[slug] = [];
    let count = 0;
    for (const url of urls.slice(0, 5)) { // first 5 per project
      const ext = path.extname(url) || ".jpg";
      const filename = `${slug}_${count}${ext}`;
      const dest = path.join(targetDir, filename);
      await download(url, dest);
      localMap[slug].push(`/media/projects/${filename}`);
      count++;
    }
  }

  fs.writeFileSync("scripts/local_images_map.json", JSON.stringify(localMap, null, 2));
  console.log("Finished downloading key media.");
}

run();
