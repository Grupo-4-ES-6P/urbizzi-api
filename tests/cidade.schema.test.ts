import { describe, expect, it } from "vitest";
import { validateCidadeInput } from "../src/modules/cidade/schemas/cidade.schema";

describe("Cidade schema", () => {
  it("deve validar uma cidade válida", () => {
    const result = validateCidadeInput({ nome: "São Paulo" });

    expect(result.data).toEqual({ nome: "São Paulo" });
    expect(result.error).toBeUndefined();
  });

  it("deve rejeitar nome vazio", () => {
    const result = validateCidadeInput({ nome: "" });

    expect(result.error).toBe("Nome da cidade não pode estar vazio.");
  });

  it("deve rejeitar nome somente com espaços", () => {
    const result = validateCidadeInput({ nome: "   " });

    expect(result.error).toBe("Nome da cidade não pode estar vazio.");
  });

  it("deve rejeitar nome com tipo inválido", () => {
    const result = validateCidadeInput({ nome: 123 });

    expect(result.error).toBe("Nome da cidade é obrigatório.");
  });
});
