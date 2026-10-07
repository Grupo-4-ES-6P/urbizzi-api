//import { jogadorSchema } from "@jogador/infra/schemas/jogador.schema";
//import { administradorSchema} from "@administrador/infra/schemas/administrador.schema";

import {
  bigserial,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const statusUsuarioEnum = pgEnum("status_usuario", [
  "PENDENTE_ATIVACAO",
  "ATIVO",
  "INATIVO",
]);

export const usuariosSchema = pgTable("usuarios", {
  id: bigserial({ mode: "bigint" }).primaryKey().notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  jogadorId: bigserial("jogador_id", { mode: "bigint" }), // .references(() => jogadorSchema.id), // FK opcional
  administradorId: bigserial("administrador_id", { mode: "bigint" }), // .references(() => administardorSchema.id), // FK opcional
  permissions: text("permissions").array().notNull(),
  status: statusUsuarioEnum("status").notNull().default("ATIVO"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
