import { clienteSchema } from "@modules/clientes/infra/schemas/cliente.schema";
import { loteSchema } from "@modules/lote/infra/schemas/lote.schema";
import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import {
  integer,
  jsonb,
  varchar,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const propostaSchema = pgTable("proposta", {
  idProposta: serial("id_proposta").primaryKey(),
  codigo: varchar("codigo", { length: 40 }),
  detalhes: jsonb("detalhes").$type<Record<string, unknown>>().notNull().default({}),
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
  idLote: integer("id_lote")
    .notNull()
    .references(() => loteSchema.id),
  idUsuario: integer("id_usuario")
    .notNull()
    .references(() => usuariosSchema.id),
  idCliente: integer("id_cliente")
    .notNull()
    .references(() => clienteSchema.id),
});
