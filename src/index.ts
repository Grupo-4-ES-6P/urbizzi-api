import { healthCheck } from "./modules/cidade/controllers/health.controller";
import { cidadeRouter } from "./modules/cidade/routes/cidade.routes";
import { Router } from "express";

export const router = Router();

router.get("/health", healthCheck);
router.use("/cidades", cidadeRouter);
