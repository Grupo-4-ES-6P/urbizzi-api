import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const loteamentoSchema = pgTable("loteamento", {
  idLoteamento: serial("id_loteamento").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  situacao: text("situacao").notNull(),
  publicado: boolean("publicado").notNull(),
  idBairro: integer("id_bairro").notNull(),
});
