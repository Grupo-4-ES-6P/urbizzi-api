import { bigint, pgTable, varchar } from "drizzle-orm/pg-core";

export const cidadeTable = pgTable("cidade", {
  idCidade: bigint("id_cidade", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity()
    .notNull(),
  nome: varchar("nome", { length: 256 }).notNull()
});
