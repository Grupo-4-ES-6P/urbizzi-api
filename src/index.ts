import { healthCheck } from "./modules/cidade/controllers/health.controller";
import { cidadeRouter } from "./modules/cidade/routes/cidade.routes";

import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle({ client: pool });

import { Router } from "express";

export const router = Router();

router.get("/health", healthCheck);
router.use("/cidades", cidadeRouter);