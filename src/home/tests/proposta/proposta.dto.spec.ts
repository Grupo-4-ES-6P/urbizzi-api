import { CreatePropostaDto } from "@modules/proposta/application/dto/create-proposta.dto";
import { UpdatePropostaDto } from "@modules/proposta/application/dto/update-proposta.dto";
import { validate } from "class-validator";

const valid = {
  valor: "120000.75",
  condicoes: "À vista",
  status: "em análise",
  idLote: 2,
  idCliente: 4,
};

describe("Proposta DTO", () => {
  it("aceita criação válida", async () => {
    await expect(
      validate(Object.assign(new CreatePropostaDto(), valid)),
    ).resolves.toHaveLength(0);
  });

  it("rejeita valores, referências e datas inválidas", async () => {
    for (const invalid of [
      { valor: "12,00" },
      { idLote: 0 },
      { idCliente: "4" },
      { condicoes: "" },
      { prazoResposta: "ontem" },
    ]) {
      const errors = await validate(
        Object.assign(new CreatePropostaDto(), valid, invalid),
      );
      expect(errors.length).toBeGreaterThan(0);
    }
  });

  it("aceita atualização parcial e rejeita tipos inválidos", async () => {
    await expect(
      validate(
        Object.assign(new UpdatePropostaDto(), { condicoes: "Parcelado" }),
      ),
    ).resolves.toHaveLength(0);
    await expect(
      validate(Object.assign(new UpdatePropostaDto(), { status: 1 })),
    ).resolves.not.toHaveLength(0);
    await expect(
      validate(Object.assign(new UpdatePropostaDto(), { idLote: 0 })),
    ).resolves.not.toHaveLength(0);
  });
});
