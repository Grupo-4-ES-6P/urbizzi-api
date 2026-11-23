import { NotificacaoService, quemTemPermissao } from "@modules/notificacoes/application/notificacao.service";
import type { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";

const usuarios = [
  { id: 1n, perfil: "ADMINISTRADOR", permissions: [] },
  { id: 2n, perfil: "GERENTE", permissions: [] },
  { id: 3n, perfil: "CORRETOR", permissions: [] },
  { id: 4n, perfil: "CORRETOR", permissions: ["aprovar_proposta"] },
];

/** Imita select().from().where() e insert().values().onConflictDoNothing(). */
function makeDrizzle(falharInsert = false) {
  const inseridos: unknown[] = [];
  const select = { from: () => select, where: async () => usuarios };
  const insert = {
    values: (v: unknown[]) => {
      if (falharInsert) throw new Error("banco fora");
      inseridos.push(...v);
      return insert;
    },
    onConflictDoNothing: async () => undefined,
  };
  const db = { select: () => select, insert: () => insert };
  return { drizzle: { db } as unknown as DrizzleService, inseridos };
}

const permissoes = {
  obterMatriz: async () => ({ matriz: { APROVAR_PROPOSTA: ["GERENTE"] } }),
} as unknown as PermissaoService;

const evento = { tipo: "proposta_pendente", titulo: "T", mensagem: "M", link: "/propostas/1", chave: "proposta-pendente:1:1" };

describe("Notificações", () => {
  it("recebe quem tem a permissão pelo perfil, por permissão extra ou é administrador", () => {
    expect(quemTemPermissao(usuarios, ["GERENTE"], "APROVAR_PROPOSTA")).toEqual([1n, 2n, 4n]);
  });

  it("não avisa quem causou o evento e junta destinatários sem repetir", async () => {
    const { drizzle, inseridos } = makeDrizzle();
    const service = new NotificacaoService(drizzle, permissoes);

    await service.notificar(evento, { permissao: "APROVAR_PROPOSTA", usuarios: ["2", 3n], exceto: "4" });

    expect(inseridos.map((n) => (n as { idUsuario: bigint }).idUsuario)).toEqual([2n, 3n, 1n]);
  });

  it("falha ao gravar a notificação não derruba a operação principal", async () => {
    const { drizzle } = makeDrizzle(true);
    const service = new NotificacaoService(drizzle, permissoes);

    await expect(service.notificar(evento, { usuarios: [1n] })).resolves.toBeUndefined();
  });
});
