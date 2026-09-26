import { bigint, bigserial, pgTable, varchar } from "drizzle-orm/pg-core";

export const logradouroSchema = pgTable("logradouro", {
  idLogradouro: bigserial("id_logradouro", { mode: "bigint" }).primaryKey(),
  nome: varchar("nome", { length: 256 }).notNull(),
  idCidade: bigint("id_cidade", { mode: "bigint" }).notNull(),
});
