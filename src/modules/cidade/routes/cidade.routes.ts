import { Router } from "express";
import {
  createCidade,
  deleteCidade,
  findAllCidades,
  findCidadeById,
  updateCidade
} from "../controllers/cidade.controller";

export const cidadeRouter = Router();

cidadeRouter.post("/", createCidade);
cidadeRouter.get("/", findAllCidades);
cidadeRouter.get("/:id", findCidadeById);
cidadeRouter.put("/:id", updateCidade);
cidadeRouter.delete("/:id", deleteCidade);
