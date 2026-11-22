import { anexoSchema } from "@modules/anexo/infra/schemas/anexo.schema";
import { perfilUsuarioEnum } from "@modules/permissoes/infra/schemas/perfil-permissao.schema";

import {
  bigint,
  bigserial,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const statusUsuarioEnum = pgEnum("status_usuario", [
  "PENDENTE_ATIVACAO",
  "ATIVO",
  "INATIVO",
]);

export const usuariosSchema = pgTable("usuarios", {
  id: bigserial({ mode: "bigint" }).primaryKey().notNull().unique(),
  name: varchar("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  permissions: text("permissions").array().notNull(),
  status: statusUsuarioEnum("status").notNull().default("PENDENTE_ATIVACAO"),
  perfil: perfilUsuarioEnum("perfil").notNull().default("CORRETOR"),
  ultimoAcesso: timestamp("ultimo_acesso", { withTimezone: true }),
  anexoId: bigint("anexo_id", { mode: "bigint" }).references(() => anexoSchema.idAnexo), // FK opcional
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
