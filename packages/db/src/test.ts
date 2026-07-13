import { db } from "./client.js";
import { organizations } from "./schema.js";

const result = await db.select().from(organizations);
console.log(result);
process.exit(0);
