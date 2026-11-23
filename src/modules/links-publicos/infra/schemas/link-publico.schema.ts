import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { bigint, bigserial, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const linkPublicoSchema = pgTable("link_publico", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  token: varchar("token", { length: 32 }).notNull().unique(),
  escopo: varchar("escopo", { length: 20 }).notNull(),
  alvo: varchar("alvo", { length: 64 }),
  expiraEm: timestamp("expira_em", { withTimezone: true }),
  visitas: integer("visitas").notNull().default(0),
  idUsuario: bigint("id_usuario", { mode: "bigint" }).references(() => usuariosSchema.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
