import { join } from "node:path";
import { Logger } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

export async function runMigrations(): Promise<void> {
  const logger = new Logger("Migrations");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await migrate(drizzle(pool), {
      migrationsFolder:
        process.env.MIGRATIONS_DIR ??
        join(process.cwd(), "src/shared/infra/database/drizzle"),
    });
    logger.log("Migrations aplicadas.");
  } finally {
    await pool.end();
  }
}
