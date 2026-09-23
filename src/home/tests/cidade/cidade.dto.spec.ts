import { CreateCidadeDto } from "@modules/cidade/application/dto/create-cidade.dto";
import { validate } from "class-validator";

const validateNome = async (nome: unknown) => {
  const dto = new CreateCidadeDto();
  dto.nome = nome as string;
  return validate(dto);
};

describe("CreateCidadeDto", () => {
  it("deve aceitar nome válido", async () => {
    await expect(validateNome("São Paulo")).resolves.toHaveLength(0);
  });

  it("deve rejeitar nome vazio", async () => {
    await expect(validateNome("")).resolves.not.toHaveLength(0);
  });

  it("deve delegar nome apenas com espaços à regra do serviço", async () => {
    await expect(validateNome("   ")).resolves.toHaveLength(0);
  });

  it("deve rejeitar nome com tipo inválido", async () => {
    await expect(validateNome(123)).resolves.not.toHaveLength(0);
  });
});
