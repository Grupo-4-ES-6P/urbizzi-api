import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { bigint, bigserial, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const relatorioGeradoSchema = pgTable("relatorio_gerado", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  nome: varchar("nome", { length: 80 }).notNull(),
  periodo: varchar("periodo", { length: 40 }).notNull(),
  formato: varchar("formato", { length: 10 }).notNull(),
  registros: integer("registros").notNull().default(0),
  idUsuario: bigint("id_usuario", { mode: "bigint" }).references(() => usuariosSchema.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
