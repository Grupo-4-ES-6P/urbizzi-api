export interface CidadeInput {
  nome: string;
}

export interface CidadeValidationResult {
  data?: CidadeInput;
  error?: string;
}

export function validateCidadeInput(input: unknown): CidadeValidationResult {
  if (!input || typeof input !== "object") {
    return { error: "Cidade é obrigatória." };
  }

  const nome = (input as Partial<Record<keyof CidadeInput, unknown>>).nome;

  if (typeof nome !== "string") {
    return { error: "Nome da cidade é obrigatório." };
  }

  const trimmedNome = nome.trim();

  if (trimmedNome.length === 0) {
    return { error: "Nome da cidade não pode estar vázio." };
  }

  return {
    data: {
      nome: trimmedNome
    }
  };
}
