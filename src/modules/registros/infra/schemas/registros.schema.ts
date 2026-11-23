import { clienteSchema } from "@modules/clientes/infra/schemas/cliente.schema";
import { loteSchema } from "@modules/lote/infra/schemas/lote.schema";
import {
  bigint,
  bigserial,
  doublePrecision,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/** Mesmo formato para todos os registros comerciais do imóvel. */
function tabelaRegistro(nome: string) {
  return pgTable(nome, {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    codigo: varchar("codigo", { length: 40 }),
    idLote: bigint("id_lote", { mode: "bigint" }).references(() => loteSchema.id),
    idCliente: bigint("id_cliente", { mode: "bigint" }).references(() => clienteSchema.id),
    status: varchar("status", { length: 40 }),
    data: timestamp("data", { withTimezone: true }),
    valor: doublePrecision("valor"),
    detalhes: jsonb("detalhes").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  });
}

export type TabelaRegistro = ReturnType<typeof tabelaRegistro>;

export const reservaSchema = tabelaRegistro("reserva");
export const vendaSchema = tabelaRegistro("venda");
export const interesseSchema = tabelaRegistro("interesse");
export const historicoImovelSchema = tabelaRegistro("historico_imovel");
export const documentoImovelSchema = tabelaRegistro("documento_imovel");
