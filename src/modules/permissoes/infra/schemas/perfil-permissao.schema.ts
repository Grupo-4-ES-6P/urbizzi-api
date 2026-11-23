import { pgEnum, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const perfilUsuarioEnum = pgEnum("perfil_usuario", [
  "ADMINISTRADOR",
  "GERENTE_COMERCIAL",
  "CORRETOR",
  "COLETOR",
]);

export const perfilPermissaoSchema = pgTable(
  "perfil_permissao",
  {
    perfil: perfilUsuarioEnum("perfil").notNull(),
    permissao: varchar("permissao", { length: 64 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.perfil, table.permissao] })],
);
