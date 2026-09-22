import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../../config/env";

export const pool = new Pool({
  connectionString: env.dbUrl
});

export const db = drizzle({ client: pool });
