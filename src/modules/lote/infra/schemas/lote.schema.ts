import { quadraSchema } from "@modules/quadra/infra/schemas/quadra.schema";
import { logradouroSchema } from "@modules/logradouro/infra/schemas/logradouro.schema";
import { anexoSchema } from "@modules/anexo/infra/schemas/anexo.schema";
import {
  bigint,
  bigserial,
  boolean,
  doublePrecision,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const loteSchema = pgTable("lote", {
    id: bigserial("id_lote", {mode: "bigint"}).primaryKey().notNull().unique(),
    matricula: text("matricula").unique(),
    tipo: varchar("tipo").notNull(),
    areaQuadrada: doublePrecision("area_quadrada"),
    valor: doublePrecision("valor"),
    estado: varchar("estado").notNull(),
    informacoesComplementares: text("informacoes_complementares"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    publicado: boolean("publicado").notNull(),
    idQuadra: bigint("id_quadra", {mode: "bigint"}).references(() => quadraSchema.id),
    idLogradouro: bigint("id_logradouro", {mode: "bigint"}).references(() => logradouroSchema.idLogradouro),
    idAnexo: bigint("id_anexo", {mode: "bigint"}).references(() => anexoSchema.idAnexo),
    // Dados de tela (código, fotos, bloqueio...)
    detalhes: jsonb("detalhes").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
