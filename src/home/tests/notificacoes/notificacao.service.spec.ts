import { NotificacaoService, quemTemPermissao } from "@modules/notificacoes/application/notificacao.service";
import type { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import type { ConfigNotificacaoService } from "@modules/notificacoes/application/config-notificacao.service";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import type { EmailService } from "@shared/infra/email/email.service";

const usuarios = [
  { id: 1n, perfil: "ADMINISTRADOR", permissions: [], email: "a@x.com", nome: "A" },
  { id: 2n, perfil: "GERENTE", permissions: [], email: "g@x.com", nome: "G" },
  { id: 3n, perfil: "CORRETOR", permissions: [], email: "c@x.com", nome: "C" },
  { id: 4n, perfil: "CORRETOR", permissions: ["aprovar_proposta"], email: "d@x.com", nome: "D" },
];

/** Imita select().from().where() e insert().values().onConflictDoNothing(). */
function makeDrizzle(falharInsert = false) {
  const inseridos: unknown[] = [];
  const select = { from: () => select, where: async () => usuarios };
  let ultimo: unknown[] = [];
  const insert = {
    values: (v: unknown[]) => {
      if (falharInsert) throw new Error("banco fora");
      inseridos.push(...v);
      ultimo = v;
      return insert;
    },
    onConflictDoNothing: () => insert,
    returning: async () => ultimo,
  };
  const db = { select: () => select, insert: () => insert };
  return { drizzle: { db } as unknown as DrizzleService, inseridos };
}

const permissoes = {
  obterMatriz: async () => ({ matriz: { APROVAR_PROPOSTA: ["GERENTE"] } }),
} as unknown as PermissaoService;

function makeService(drizzle: DrizzleService, config = { ativo: true, email: false }) {
  const email = { enviar: jest.fn() };
  const configService = { doTipo: async () => config } as unknown as ConfigNotificacaoService;
  const service = new NotificacaoService(drizzle, permissoes, configService, email as unknown as EmailService);
  return { service, email };
}

const evento = { tipo: "proposta_pendente", titulo: "T", mensagem: "M", link: "/propostas/1", chave: "proposta-pendente:1:1" };

describe("Notificações", () => {
  it("recebe quem tem a permissão pelo perfil, por permissão extra ou é administrador", () => {
    expect(quemTemPermissao(usuarios, ["GERENTE"], "APROVAR_PROPOSTA")).toEqual([1n, 2n, 4n]);
  });

  it("não avisa quem causou o evento e junta destinatários sem repetir", async () => {
    const { drizzle, inseridos } = makeDrizzle();
    const { service } = makeService(drizzle);

    await service.notificar(evento, { permissao: "APROVAR_PROPOSTA", usuarios: ["2", 3n], exceto: "4" });

    expect(inseridos.map((n) => (n as { idUsuario: bigint }).idUsuario)).toEqual([2n, 3n, 1n]);
  });

  it("falha ao gravar a notificação não derruba a operação principal", async () => {
    const { drizzle } = makeDrizzle(true);
    const { service } = makeService(drizzle);

    await expect(service.notificar(evento, { usuarios: [1n] })).resolves.toBeUndefined();
  });

  it("alerta desligado na configuração não gera notificação", async () => {
    const { drizzle, inseridos } = makeDrizzle();
    const { service } = makeService(drizzle, { ativo: false, email: false });

    await service.notificar(evento, { usuarios: [1n] });

    expect(inseridos).toHaveLength(0);
  });

  it("com e-mail ligado, envia para quem recebeu o aviso", async () => {
    const { drizzle } = makeDrizzle();
    const { service, email } = makeService(drizzle, { ativo: true, email: true });

    await service.notificar(evento, { usuarios: [1n, 2n] });

    expect(email.enviar).toHaveBeenCalledTimes(usuarios.length);
    expect(email.enviar).toHaveBeenCalledWith(expect.objectContaining({ para: "a@x.com", assunto: "T — Urbizzi" }));
  });
});
