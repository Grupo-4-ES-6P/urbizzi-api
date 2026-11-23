import {
  bigserial,
  date,
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
    telefone: varchar("telefone", { length: 13 }),
    celular: varchar("celular", { length: 13 }),
    email: varchar("email", { length: 256 }),
    origem: varchar("origem", { length: 256 }),
    rg: varchar("rg", { length: 20 }),
    dataNascimento: date("data_nascimento", { mode: "string" }),
    estadoCivil: varchar("estado_civil", { length: 30 }),
    profissao: varchar("profissao", { length: 120 }),
    responsavel: varchar("responsavel", { length: 256 }),
    imovelInteresseId: varchar("imovel_interesse_id", { length: 64 }),
    enderecoCep: varchar("endereco_cep", { length: 8 }),
    enderecoLogradouro: varchar("endereco_logradouro", { length: 256 }),
    enderecoNumero: varchar("endereco_numero", { length: 20 }),
    enderecoComplemento: varchar("endereco_complemento", { length: 120 }),
    enderecoBairro: varchar("endereco_bairro", { length: 120 }),
    enderecoCidade: varchar("endereco_cidade", { length: 120 }),
    enderecoUf: varchar("endereco_uf", { length: 2 }),
    enderecoPais: varchar("endereco_pais", { length: 60 }),
    status: statusClienteEnum("status").notNull().default("ATIVO"),
    dataCadastro: timestamp("data_cadastro", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dataAtualizacao: timestamp("data_atualizacao", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("cliente_documento_unique").on(table.documentoIdentificacao),
  ],
);
