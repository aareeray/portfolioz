import fs from "node:fs";

const res = await fetch('https://framerusercontent.com/sites/4CUEbC1Vb07LtNCTtfjk6i/searchIndex-sm9Ero6NxH9K.json');
const data = await res.json();

console.log("All indexed routes:", Object.keys(data));
fs.writeFileSync('scripts/searchIndex.json', JSON.stringify(data, null, 2));
console.log("Saved to scripts/searchIndex.json");
