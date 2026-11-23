import { RegistroService } from "@modules/registros/application/registro.service";
import { vendaSchema } from "@modules/registros/infra/schemas/registros.schema";
import { REGISTROS } from "@modules/registros/registros.config";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";

const linha = {
  id: 7n,
  codigo: "VD-1",
  idLote: 3n,
  idCliente: 4n,
  status: "ativa",
  data: new Date("2026-11-20T10:00:00Z"),
  valor: 90000,
  detalhes: { corretorId: "2" },
  createdAt: new Date("2026-11-20T10:00:00Z"),
  updatedAt: new Date("2026-11-20T10:00:00Z"),
};

/** Imita a cadeia do Drizzle (select().from().where()...). */
function makeDrizzle(resultadoSelect: unknown[] = [linha]) {
  const valores: unknown[] = [];
  const cadeia = {
    from: () => cadeia,
    where: () => cadeia,
    orderBy: async () => resultadoSelect,
    limit: async () => resultadoSelect,
    values: (v: unknown) => {
      valores.push(v);
      return cadeia;
    },
    set: (v: unknown) => {
      valores.push(v);
      return cadeia;
    },
    returning: async () => [linha],
  };
  const db = { select: () => cadeia, insert: () => cadeia, update: () => cadeia, delete: () => cadeia };
  return { drizzle: { db } as unknown as DrizzleService, valores };
}

const config = { nome: "Venda", tabela: vendaSchema, statusExigem: { cancelada: "CANCELAR_VENDA" } };
const gerente = { sub: "2", email: "g@x", idJogador: null, idAdministrador: null, permissoes: ["REGISTRAR_VENDA"] };

describe("RegistroService", () => {
  it("cria convertendo ids e data, e responde em texto/ISO", async () => {
    const { drizzle, valores } = makeDrizzle();

    const resposta = await new RegistroService(drizzle, config).criar(
      { idLote: 3, idCliente: 4, status: "ativa", data: "2026-11-20T10:00:00Z", valor: 90000, codigo: " VD-1 " },
      gerente,
    );

    expect(valores[0]).toMatchObject({ idLote: 3n, idCliente: 4n, codigo: "VD-1", detalhes: {} });
    expect(resposta).toMatchObject({ id: "7", idLote: "3", idCliente: "4", data: "2026-11-20T10:00:00.000Z" });
  });

  it("só quem tem a permissão aplica o status protegido", async () => {
    const { drizzle } = makeDrizzle();
    const service = new RegistroService(drizzle, config);

    await expect(service.atualizar("7", { status: "cancelada" }, gerente)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.atualizar("7", { status: "cancelada" }, { ...gerente, permissoes: ["CANCELAR_VENDA"] }),
    ).resolves.toBeDefined();
    await expect(service.atualizar("7", { status: "cancelada" }, { ...gerente, permissoes: ["ADMIN"] })).resolves.toBeDefined();
  });

  it("na edição só envia o que veio, e null apaga", async () => {
    const { drizzle, valores } = makeDrizzle();

    await new RegistroService(drizzle, config).atualizar("7", { valor: null, detalhes: { motivo: "x" } }, gerente);

    expect(valores[0]).toMatchObject({ valor: null, detalhes: { motivo: "x" } });
    expect(valores[0]).not.toHaveProperty("status");
  });

  it("responde 404 para registro inexistente", async () => {
    const { drizzle } = makeDrizzle([]);
    await expect(new RegistroService(drizzle, config).buscar("99")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("configura as rotas e permissões da matriz", () => {
    const porRota = Object.fromEntries(REGISTROS.map((r) => [r.rota, r]));
    expect(porRota.reservas).toMatchObject({ escrita: "REGISTRAR_RESERVA", statusExigem: { cancelada: "CANCELAR_RESERVA" } });
    expect(porRota.vendas).toMatchObject({ escrita: "REGISTRAR_VENDA", statusExigem: { cancelada: "CANCELAR_VENDA" } });
    expect(Object.keys(porRota).sort()).toEqual(["documentos", "historico", "interesses", "reservas", "vendas"]);
  });
});
