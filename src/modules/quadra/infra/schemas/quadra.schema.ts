import { loteamentoSchema } from "@modules/loteamento/infra/schemas/loteamento.schema";

import {
  bigserial,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const quadraSchema = pgTable("quadras", {
    id: bigserial("id_quadra", { mode: "bigint" }).primaryKey().notNull().unique(),
    identificacao: varchar("identificacao").notNull(),
    idLoteamento: bigserial("id_loteamento", { mode: "bigint" }).notNull().references(() => loteamentoSchema.idLoteamento),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});