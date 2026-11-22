import { quadraSchema } from "@modules/quadra/infra/schemas/quadra.schema";
import { logradouroSchema } from "@modules/logradouro/infra/schemas/logradouro.schema";
import { anexoSchema } from "@modules/anexo/infra/schemas/anexo.schema";
import {
  bigserial,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/pg-core";
import { doublePrecision } from "drizzle-orm/pg-core";

export const loteSchema = pgTable("lote", {
    id: bigserial("id_lote", {mode: "bigint"}).primaryKey().notNull().unique(),
    matricula: text("matricula").unique(),
    tipo: varchar("tipo").notNull(),
    areaQuadrada: doublePrecision("area_quadrada").notNull(),
    valor: doublePrecision("valor").notNull(),
    estado: varchar("estado").notNull(),
    informacoesComplementares: text("informacoes_complementares"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    publicado: boolean("publicado").notNull(),
    idQuadra: bigserial("id_quadra", {mode: "bigint"}).notNull().references(() => quadraSchema.id),
    idLogradouro: bigserial("id_logradouro", {mode: "bigint"}).notNull().references(() => logradouroSchema.idLogradouro),
    idAnexo: bigserial("id_anexo", {mode: "bigint"}).references(() => anexoSchema.idAnexo),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});