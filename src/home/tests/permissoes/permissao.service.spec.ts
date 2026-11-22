import { PermissaoService } from "@modules/permissoes/application/services/permissao.service";
import {
  MATRIZ_PADRAO,
  Perfil,
  PERMISSOES_BASE,
  permissoesDoPerfil,
} from "@modules/permissoes/domain/permissoes.catalogo";
import type { PerfilPermissaoRepository } from "@modules/permissoes/domain/repositories/perfil-permissao.repository";
import { BadRequestException } from "@nestjs/common";
import type { Mocked } from "jest-mock";

const makeRepository = (): Mocked<PerfilPermissaoRepository> => ({
  findAll: jest.fn().mockResolvedValue([]),
  isEmpty: jest.fn().mockResolvedValue(false),
  insertMany: jest.fn(),
  remove: jest.fn(),
});

describe("permissoesDoPerfil", () => {
  it("dá a base e traduz as funcionalidades liberadas em permissões de endpoint", () => {
    const permissoes = permissoesDoPerfil(Perfil.ADMINISTRADOR, MATRIZ_PADRAO);

    expect(permissoes).toEqual(
      expect.arrayContaining(PERMISSOES_BASE.map((p) => p.toUpperCase())),
    );
    expect(permissoes).toEqual(
      expect.arrayContaining(["GERENCIAR_USUARIOS", "USER:WRITE", "QUADRA:WRITE"]),
    );
  });

  it("não libera gestão de usuários para corretor", () => {
    const permissoes = permissoesDoPerfil(Perfil.CORRETOR, MATRIZ_PADRAO);

    expect(permissoes).toContain("CRIAR_PROPOSTA");
    expect(permissoes).not.toContain("GERENCIAR_USUARIOS");
    expect(permissoes).not.toContain("USER:READ");
  });

  it("normaliza extras e remove duplicadas", () => {
    const permissoes = permissoesDoPerfil(Perfil.COLETOR, MATRIZ_PADRAO, [
      " admin ",
      "CLIENTE_VISUALIZAR",
    ]);

    expect(permissoes).toContain("ADMIN");
    expect(permissoes.filter((p) => p === "CLIENTE_VISUALIZAR")).toHaveLength(1);
  });
});

describe("PermissaoService", () => {
  it("cria a matriz padrão quando a tabela está vazia", async () => {
    const repository = makeRepository();
    repository.isEmpty.mockResolvedValue(true);

    await new PermissaoService(repository).onApplicationBootstrap();

    expect(repository.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        { perfil: Perfil.ADMINISTRADOR, permissao: "GERENCIAR_USUARIOS" },
        { perfil: Perfil.CORRETOR, permissao: "CRIAR_PROPOSTA" },
      ]),
    );
  });

  it("não recria a matriz quando já existe", async () => {
    const repository = makeRepository();

    await new PermissaoService(repository).onApplicationBootstrap();

    expect(repository.insertMany).not.toHaveBeenCalled();
  });

  it("monta a matriz a partir das linhas do banco", async () => {
    const repository = makeRepository();
    repository.findAll.mockResolvedValue([
      { perfil: Perfil.CORRETOR, permissao: "CRIAR_PROPOSTA" },
      { perfil: Perfil.ADMINISTRADOR, permissao: "CRIAR_PROPOSTA" },
    ]);

    const { matriz } = await new PermissaoService(repository).obterMatriz();

    expect(matriz.CRIAR_PROPOSTA).toEqual([Perfil.CORRETOR, Perfil.ADMINISTRADOR]);
    expect(matriz.APROVAR_DESCONTO).toEqual([]);
  });

  it("libera e bloqueia uma célula da matriz", async () => {
    const repository = makeRepository();
    const service = new PermissaoService(repository);

    await service.alterar({ permissao: "registrar_venda", perfil: Perfil.CORRETOR, liberado: true });
    await service.alterar({ permissao: "REGISTRAR_VENDA", perfil: Perfil.CORRETOR, liberado: false });

    expect(repository.insertMany).toHaveBeenCalledWith([
      { perfil: Perfil.CORRETOR, permissao: "REGISTRAR_VENDA" },
    ]);
    expect(repository.remove).toHaveBeenCalledWith({
      perfil: Perfil.CORRETOR,
      permissao: "REGISTRAR_VENDA",
    });
  });

  it("recusa permissão desconhecida", async () => {
    const service = new PermissaoService(makeRepository());

    await expect(
      service.alterar({ permissao: "VOAR", perfil: Perfil.CORRETOR, liberado: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("não deixa o administrador perder a gestão de usuários", async () => {
    const repository = makeRepository();
    const service = new PermissaoService(repository);

    await expect(
      service.alterar({
        permissao: "GERENCIAR_USUARIOS",
        perfil: Perfil.ADMINISTRADOR,
        liberado: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
