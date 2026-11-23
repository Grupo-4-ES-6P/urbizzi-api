import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/** Uma linha por tipo de alerta; tipo sem linha usa o padrão do código. */
export const configNotificacaoSchema = pgTable("config_notificacao", {
  tipo: varchar("tipo", { length: 40 }).primaryKey(),
  ativo: boolean("ativo").notNull().default(true),
  email: boolean("email").notNull().default(false),
  antecedenciaHoras: integer("antecedencia_horas"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
