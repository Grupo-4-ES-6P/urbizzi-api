import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const propostaSchema = pgTable("proposta", {
  idProposta: serial("id_proposta").primaryKey(),
  valor: numeric("valor").notNull(),
  condicoes: text("condicoes").notNull(),
  observacoes: text("observacoes"),
  versao: integer("versao").notNull().default(1),
  status: text("status").notNull(),
  justificativa: text("justificativa"),
  prazoResposta: timestamp("prazo_resposta", { withTimezone: true }),
  dataCriacao: timestamp("data_criacao", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dataVenda: timestamp("data_venda", { withTimezone: true }),
  dataCancelamento: timestamp("data_cancelamento", { withTimezone: true }),
  idLote: integer("id_lote").notNull(),
  idUsuario: integer("id_usuario").notNull(),
  idCliente: integer("id_cliente").notNull(),
});
