import {
  bigint,
  bigserial,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const administradorSchema = pgTable(
  "administrador",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    nome: varchar("nome", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    cnpj: varchar("cnpj", { length: 20 }).notNull(),
    idEndereco: bigint("id_endereco", { mode: "bigint" }).notNull(),
  },
  (table) => [
    uniqueIndex("administrador_email_unique").on(table.email),
    uniqueIndex("administrador_cnpj_unique").on(table.cnpj),
  ],
);
