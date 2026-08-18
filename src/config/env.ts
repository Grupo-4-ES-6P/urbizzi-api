import { config } from "dotenv";

config();

const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port)) {
  throw new Error("PORT deve ser um numero valido.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port
};
