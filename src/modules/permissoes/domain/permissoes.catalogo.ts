import { Permission } from "@shared/domain/enums/permission.enum";

export enum Perfil {
  ADMINISTRADOR = "ADMINISTRADOR",
  GERENTE_COMERCIAL = "GERENTE_COMERCIAL",
  CORRETOR = "CORRETOR",
  COLETOR = "COLETOR",
}

export const PERFIS = Object.values(Perfil);

export const PERMISSOES_SISTEMA = [
  { id: "CADASTRAR_IMOVEIS", rotulo: "Cadastrar e editar imóveis" },
  { id: "PUBLICAR_CATALOGO", rotulo: "Publicar imóvel no catálogo público" },
  { id: "REGISTRAR_RESERVA", rotulo: "Registrar reserva para cliente" },
  { id: "CANCELAR_RESERVA", rotulo: "Cancelar reserva antes do vencimento" },
  { id: "CRIAR_PROPOSTA", rotulo: "Criar proposta comercial" },
  { id: "APROVAR_PROPOSTA", rotulo: "Aprovar proposta dentro da alçada" },
  { id: "APROVAR_DESCONTO", rotulo: "Aprovar desconto acima de 5%" },
  { id: "REGISTRAR_VENDA", rotulo: "Registrar venda" },
  { id: "CANCELAR_VENDA", rotulo: "Cancelar venda registrada" },
  { id: "EMITIR_RELATORIOS", rotulo: "Emitir relatórios e exportar dados" },
  { id: "GERENCIAR_USUARIOS", rotulo: "Gerenciar usuários e permissões" },
] as const;

export type PermissaoSistema = (typeof PERMISSOES_SISTEMA)[number]["id"];

export const IDS_PERMISSOES: readonly string[] = PERMISSOES_SISTEMA.map(
  (permissao) => permissao.id,
);

export const PERMISSAO_TRAVADA: PermissaoSistema = "GERENCIAR_USUARIOS";

export type MatrizPermissoes = Record<PermissaoSistema, Perfil[]>;

const { ADMINISTRADOR, GERENTE_COMERCIAL, CORRETOR, COLETOR } = Perfil;

export const MATRIZ_PADRAO: MatrizPermissoes = {
  CADASTRAR_IMOVEIS: [ADMINISTRADOR, GERENTE_COMERCIAL, COLETOR],
  PUBLICAR_CATALOGO: [ADMINISTRADOR, GERENTE_COMERCIAL],
  REGISTRAR_RESERVA: [ADMINISTRADOR, GERENTE_COMERCIAL, CORRETOR],
  CANCELAR_RESERVA: [ADMINISTRADOR, GERENTE_COMERCIAL],
  CRIAR_PROPOSTA: [ADMINISTRADOR, GERENTE_COMERCIAL, CORRETOR],
  APROVAR_PROPOSTA: [ADMINISTRADOR, GERENTE_COMERCIAL],
  APROVAR_DESCONTO: [ADMINISTRADOR],
  REGISTRAR_VENDA: [ADMINISTRADOR, GERENTE_COMERCIAL],
  CANCELAR_VENDA: [ADMINISTRADOR],
  EMITIR_RELATORIOS: [ADMINISTRADOR, GERENTE_COMERCIAL],
  GERENCIAR_USUARIOS: [ADMINISTRADOR],
};

/** Liberado para qualquer usuário logado. */
export const PERMISSOES_BASE: string[] = [
  Permission.CLIENTE_VISUALIZAR,
  Permission.CLIENTE_CRIAR,
  Permission.CLIENTE_ATUALIZAR,
  Permission.CLIENTE_DESATIVAR,
  Permission.CLIENTE_REATIVAR,
  Permission.CLIENTE_EXCLUIR,
  Permission.QUADRA_READ,
  Permission.LOTE_READ,
  Permission.ANEXO_VISUALIZAR,
  Permission.ANEXO_CRIAR,
];

/** Permissões de endpoint que cada funcionalidade da matriz libera. */
export const PERMISSOES_DE_ENDPOINT: Partial<Record<PermissaoSistema, string[]>> = {
  CADASTRAR_IMOVEIS: [
    Permission.QUADRA_WRITE,
    Permission.QUADRA_UPDATE,
    Permission.QUADRA_DELETE,
    Permission.LOTE_WRITE,
    Permission.LOTE_UPDATE,
    Permission.LOTE_DELETE,
    Permission.ANEXO_ATUALIZAR,
    Permission.ANEXO_EXCLUIR,
  ],
  // Essas ações mudam a situação do imóvel
  REGISTRAR_RESERVA: [Permission.LOTE_UPDATE],
  CRIAR_PROPOSTA: [Permission.LOTE_UPDATE],
  REGISTRAR_VENDA: [Permission.LOTE_UPDATE],
  GERENCIAR_USUARIOS: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ],
};

export function permissoesDoPerfil(
  perfil: Perfil,
  matriz: MatrizPermissoes,
  extras: string[] = [],
): string[] {
  const liberadas = PERMISSOES_SISTEMA.map((p) => p.id).filter((id) =>
    matriz[id]?.includes(perfil),
  );

  const todas = [
    ...PERMISSOES_BASE,
    ...liberadas,
    ...liberadas.flatMap((id) => PERMISSOES_DE_ENDPOINT[id] ?? []),
    ...extras,
  ];

  return [...new Set(todas.map((p) => p.trim().toUpperCase()).filter(Boolean))];
}
