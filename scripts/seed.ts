/** Seed the database with placeholder content and generated media. Usage: npm run db:seed */
import { seed } from "../src/data/seed.ts";
import { closeDb } from "../src/lib/db.ts";

seed();
closeDb();
console.log("Seed complete.");
