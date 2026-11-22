import { bigint, bigserial, date, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { clienteSchema } from "./cliente.schema";

export const clienteContatoSchema = pgTable("cliente_contato", {
  id: bigserial("id_contato", { mode: "bigint" }).primaryKey(),
  idCliente: bigint("id_cliente", { mode: "bigint" })
    .notNull()
    .references(() => clienteSchema.id, { onDelete: "cascade" }),
  data: date("data", { mode: "string" }).notNull(),
  canal: varchar("canal", { length: 40 }).notNull(),
  responsavel: varchar("responsavel", { length: 256 }).notNull(),
  imovelId: varchar("imovel_id", { length: 64 }),
  assunto: text("assunto").notNull(),
  resultado: varchar("resultado", { length: 20 }).notNull(),
});
