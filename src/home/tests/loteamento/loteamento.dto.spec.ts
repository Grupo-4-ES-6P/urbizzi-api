import { CreateLoteamentoDto } from "@modules/loteamento/application/dto/create-loteamento.dto";
import { UpdateLoteamentoDto } from "@modules/loteamento/application/dto/update-loteamento.dto";
import { validate } from "class-validator";

const valid = {
  nome: "Jardim",
  descricao: "Residencial",
  situacao: "ativo",
  publicado: false,
  idBairro: 2,
};

describe("Loteamento DTO", () => {
  it("aceita criação válida", async () => {
    await expect(
      validate(Object.assign(new CreateLoteamentoDto(), valid)),
    ).resolves.toHaveLength(0);
  });

  it("rejeita ausência, tipos incorretos e idBairro inválido", async () => {
    for (const invalid of [
      { nome: "" },
      { publicado: "false" },
      { idBairro: 0 },
      { idBairro: 1.5 },
    ]) {
      const errors = await validate(
        Object.assign(new CreateLoteamentoDto(), valid, invalid),
      );
      expect(errors.length).toBeGreaterThan(0);
    }
    const missing = await validate(new CreateLoteamentoDto());
    expect(missing.length).toBeGreaterThan(0);
  });

  it("permite PATCH parcial e rejeita valores inválidos", async () => {
    await expect(
      validate(Object.assign(new UpdateLoteamentoDto(), { publicado: true })),
    ).resolves.toHaveLength(0);
    await expect(
      validate(Object.assign(new UpdateLoteamentoDto(), { idBairro: -1 })),
    ).resolves.not.toHaveLength(0);
  });
});
