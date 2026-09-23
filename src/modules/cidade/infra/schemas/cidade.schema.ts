import { bigserial, pgTable, varchar } from "drizzle-orm/pg-core";

export const cidadeSchema = pgTable("cidade", {
  idCidade: bigserial("id_cidade", { mode: "bigint" }).primaryKey(),
  nome: varchar("nome", { length: 256 }).notNull(),
});
