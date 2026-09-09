/** Apply pending database migrations. Usage: npm run db:migrate */
import { runMigrations, closeDb } from "../src/lib/db.ts";

const applied = runMigrations();
console.log(
  applied === 0 ? "No pending migrations." : `Applied ${applied} migration(s).`,
);
closeDb();
