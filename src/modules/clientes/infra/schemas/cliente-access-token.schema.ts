import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import {
  bigint,
  bigserial,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const clienteAccessTokenSchema = pgTable(
  "cliente_access_token",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    usuarioId: bigint("id_usuario", { mode: "bigint" })
      .notNull()
      .references(() => usuariosSchema.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("cliente_access_token_usuario_unique").on(table.usuarioId),
    uniqueIndex("cliente_access_token_hash_unique").on(table.tokenHash),
  ],
);
