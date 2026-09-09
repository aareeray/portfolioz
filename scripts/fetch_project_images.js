import fs from "node:fs";

async function run() {
  const routes = [
    'https://huyml.co/project/dafi',
    'https://huyml.co/project/district2-studio',
    'https://huyml.co/project/fromanother',
    'https://huyml.co/project/iventions',
    'https://huyml.co/project/wonjyou',
    'https://huyml.co/project/miuxstudio',
    'https://huyml.co/project/markwoodland',
    'https://huyml.co/project/eislab',
    'https://huyml.co/project/mat-voyce',
    'https://huyml.co/project/defiant',
    'https://huyml.co/project/by-kin',
    'https://huyml.co/project/serious-business',
    'https://huyml.co/project/uncommon-studio',
    'https://huyml.co/project/ascon-system',
    'https://huyml.co/project/mathijs-hanenkamp',
    'https://huyml.co/project/rly-network',
    'https://huyml.co/project/huyml-2022',
    'https://huyml.co/project/bison-studio',
    'https://huyml.co/project/est-populo',
    'https://huyml.co/about',
    'https://huyml.co/playground',
  ];

  const projectImages = {};

  for (const url of routes) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const imgs = [...html.matchAll(/https:\/\/framerusercontent\.com\/images\/[a-zA-Z0-9_\-]+\.(?:png|jpg|jpeg|webp|svg)/g)].map(x => x[0]);
      const uniqueImgs = [...new Set(imgs)];
      const slug = url.split('/').pop();
      projectImages[slug] = uniqueImgs;
      console.log(`Fetched ${slug}: ${uniqueImgs.length} images`);
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }

  fs.writeFileSync('scripts/project_images.json', JSON.stringify(projectImages, null, 2));
  console.log('Saved all images to scripts/project_images.json');
}

run();
