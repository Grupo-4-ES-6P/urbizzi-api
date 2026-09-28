import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import {
  bigint,
  bigserial,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const tipoDocumentoClienteEnum = pgEnum("tipo_documento_cliente", [
  "CPF",
  "CNPJ",
]);

export const statusClienteEnum = pgEnum("status_cliente", ["ATIVO", "INATIVO"]);

export const clienteSchema = pgTable(
  "cliente",
  {
    id: bigserial("id_cliente", { mode: "bigint" }).primaryKey(),
    tipoDocumento: tipoDocumentoClienteEnum("tipo_documento").notNull(),
    documentoIdentificacao: varchar("documento_identificacao", {
      length: 14,
    }).notNull(),
    nome: varchar("nome", { length: 256 }),
    razaoSocial: varchar("razao_social", { length: 256 }),
    nomeFantasia: varchar("nome_fantasia", { length: 256 }),
    telefone: varchar("telefone", { length: 13 }).notNull(),
    email: varchar("email", { length: 256 }),
    origem: varchar("origem", { length: 256 }),
    status: statusClienteEnum("status").notNull().default("ATIVO"),
    usuarioId: bigint("id_usuario", { mode: "bigint" }).references(
      () => usuariosSchema.id,
      { onDelete: "restrict" },
    ),
    dataCadastro: timestamp("data_cadastro", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dataAtualizacao: timestamp("data_atualizacao", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("cliente_documento_unique").on(table.documentoIdentificacao),
    uniqueIndex("cliente_usuario_unique").on(table.usuarioId),
  ],
);
