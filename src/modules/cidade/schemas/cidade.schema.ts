import { pgTable, varchar, bigint } from "drizzle-orm/pg-core";

export const cidadeSchema = pgTable("cidade", {
    id: bigint("id_cidade", { mode: "bigint" })
        .primaryKey()
        .generatedByDefaultAsIdentity()
        .notNull(),
    nome: varchar("nome", { length: 256 }).notNull(),
});
