import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Servidor da Urbizzi API rodando na porta ${env.port} (${env.nodeEnv}).`);
});
