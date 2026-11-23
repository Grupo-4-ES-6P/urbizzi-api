import { loteamentoSchema } from "@modules/loteamento/infra/schemas/loteamento.schema";

import {
  bigint,
  bigserial,
  doublePrecision,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const quadraSchema = pgTable(
  "quadras",
  {
    id: bigserial("id_quadra", { mode: "bigint" }).primaryKey().notNull().unique(),
    identificacao: varchar("identificacao").notNull(),
    idLoteamento: bigint("id_loteamento", { mode: "bigint" })
      .notNull()
      .references(() => loteamentoSchema.idLoteamento),
    area: doublePrecision("area"),
    testadaPara: varchar("testada_para", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("quadras_loteamento_identificacao_unique").on(
      table.idLoteamento,
      table.identificacao,
    ),
  ],
);
