import { bigint, bigserial, pgTable, varchar } from "drizzle-orm/pg-core";

export const bairroSchema = pgTable("bairro", {
  idBairro: bigserial("id_bairro", { mode: "bigint" }).primaryKey(),
  nome: varchar("nome", { length: 256 }).notNull(),
  idCidade: bigint("id_cidade", { mode: "bigint" }).notNull(),
});
