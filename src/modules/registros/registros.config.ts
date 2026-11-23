import type { ConfigRegistro } from "./application/registro.service";
import {
  documentoImovelSchema,
  historicoImovelSchema,
  interesseSchema,
  reservaSchema,
  vendaSchema,
} from "./infra/schemas/registros.schema";

export interface DefinicaoRegistro extends ConfigRegistro {
  token: symbol;
  rota: string;
  /** Permissão da matriz para criar, editar e excluir; vazio = qualquer usuário logado. */
  escrita?: string;
}

export const INTERESSES = Symbol("INTERESSES");
export const HISTORICO = Symbol("HISTORICO");

export const REGISTROS: DefinicaoRegistro[] = [
  {
    token: Symbol("RESERVAS"),
    rota: "reservas",
    nome: "Reserva",
    tabela: reservaSchema,
    escrita: "REGISTRAR_RESERVA",
    statusExigem: { cancelada: "CANCELAR_RESERVA" },
  },
  {
    token: Symbol("VENDAS"),
    rota: "vendas",
    nome: "Venda",
    tabela: vendaSchema,
    escrita: "REGISTRAR_VENDA",
    statusExigem: { cancelada: "CANCELAR_VENDA" },
  },
  { token: INTERESSES, rota: "interesses", nome: "Interesse", tabela: interesseSchema },
  { token: HISTORICO, rota: "historico", nome: "Evento", tabela: historicoImovelSchema },
  { token: Symbol("DOCUMENTOS"), rota: "documentos", nome: "Documento", tabela: documentoImovelSchema },
];
