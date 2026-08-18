import cors from "cors";
import express from "express";
import helmet from "helmet";
import { router } from "./routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Urbizzi API online"
  });
});

app.use("/api", router);
