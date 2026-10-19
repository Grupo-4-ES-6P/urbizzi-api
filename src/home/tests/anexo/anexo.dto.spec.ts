import { CreateAnexoDto } from "@modules/anexo/application/dto/create-anexo.dto";
import { UpdateAnexoDto } from "@modules/anexo/application/dto/update-anexo.dto";
import { validate } from "class-validator";

const valid = {
  tipoArquivo: "application/pdf",
  caminhoArquivo: "lotes/2/matricula.pdf",
};

describe("Anexo DTO", () => {
  it("aceita criação válida", async () => {
    await expect(
      validate(Object.assign(new CreateAnexoDto(), valid)),
    ).resolves.toHaveLength(0);
  });

  it("rejeita campos ausentes, vazios ou longos demais", async () => {
    for (const invalid of [
      { tipoArquivo: "" },
      { tipoArquivo: 1 },
      { caminhoArquivo: undefined },
      { caminhoArquivo: "a".repeat(2049) },
    ]) {
      const errors = await validate(
        Object.assign(new CreateAnexoDto(), valid, invalid),
      );
      expect(errors.length).toBeGreaterThan(0);
    }
  });

  it("aceita atualização parcial e rejeita tipos inválidos", async () => {
    await expect(
      validate(
        Object.assign(new UpdateAnexoDto(), { tipoArquivo: "image/png" }),
      ),
    ).resolves.toHaveLength(0);
    await expect(
      validate(Object.assign(new UpdateAnexoDto(), { caminhoArquivo: "" })),
    ).resolves.not.toHaveLength(0);
  });
});
