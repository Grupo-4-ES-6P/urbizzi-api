import { CreateLoteamentoDto } from "@modules/loteamento/application/dto/create-loteamento.dto";
import { LoteamentoService } from "@modules/loteamento/application/services/loteamento.service";
import { LoteamentoEntity } from "@modules/loteamento/domain/models/loteamento.entity";
import type { LoteamentoRepository } from "@modules/loteamento/domain/repositories/loteamento.repository";
import { LoteamentoController } from "@modules/loteamento/infra/controllers/loteamento.controller";
import { BadRequestException } from "@nestjs/common";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { PERMISSOES_KEY } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const loteamento = new LoteamentoEntity({
  idLoteamento: 1,
  nome: "Jardim",
  descricao: "",
  situacao: "em_comercializacao",
  publicado: false,
  idBairro: null,
});

const makeRepository = (): jest.Mocked<LoteamentoRepository> => ({
  save: jest.fn().mockResolvedValue(loteamento),
  findById: jest.fn().mockResolvedValue(loteamento),
  findMany: jest.fn(),
  update: jest.fn().mockResolvedValue(loteamento),
  remove: jest.fn(),
});

describe("Loteamento — dados de cadastro", () => {
  it("cria sem descrição, publicado e bairro, normalizando CEP e UF", async () => {
    const repository = makeRepository();

    await new LoteamentoService(repository).save({
      nome: "Jardim Universitário",
      situacao: "em_comercializacao",
      codigo: " UNI-I ",
      cep: "85900-010",
      uf: "pr",
      areaTotal: 120000,
      latitude: -24.72,
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        descricao: "",
        publicado: false,
        idBairro: null,
        codigo: "UNI-I",
        cep: "85900010",
        uf: "PR",
        areaTotal: 120000,
        latitude: -24.72,
      }),
    );
  });

  it("na edição mantém o que não veio e apaga o que veio nulo", async () => {
    const repository = makeRepository();

    await new LoteamentoService(repository).updateById("1", { cartorio: null, numeroRegistro: "R-12" });

    const enviado = repository.update.mock.calls[0][1];
    expect(enviado).toMatchObject({ cartorio: null, numeroRegistro: "R-12" });
    expect(enviado).not.toHaveProperty("matriculaMae");
  });

  it("continua recusando idBairro inválido quando enviado", async () => {
    await expect(
      new LoteamentoService(makeRepository()).save({ nome: "J", situacao: "x", idBairro: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("valida coordenadas e converte texto vazio em nulo", async () => {
    const dto = plainToInstance(CreateLoteamentoDto, {
      nome: "Jardim",
      situacao: "em_aprovacao",
      cartorio: "",
      latitude: 120,
    });

    const erros = await validate(dto);

    expect(dto.cartorio).toBeNull();
    expect(erros.map((e) => e.property)).toEqual(["latitude"]);
  });

  it("exige CADASTRAR_IMOVEIS para escrever e só login para ler", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, LoteamentoController)).toEqual([JwtAuthGuard, PermissoesGuard]);
    const permissoes = (metodo: keyof LoteamentoController) =>
      Reflect.getMetadata(PERMISSOES_KEY, LoteamentoController.prototype[metodo]);

    expect(permissoes("save")).toEqual(["CADASTRAR_IMOVEIS"]);
    expect(permissoes("update")).toEqual(["CADASTRAR_IMOVEIS"]);
    expect(permissoes("remove")).toEqual(["CADASTRAR_IMOVEIS"]);
    expect(permissoes("findMany")).toBeUndefined();
  });
});
