export class Cidade {
  constructor(
    public readonly idCidade: number,
    public readonly nome: string
  ) {
    if (!Number.isInteger(idCidade) || idCidade <= 0) {
      throw new Error("Identificador da cidade inválido.");
    }

    if (nome.trim().length === 0) {
      throw new Error("Nome da cidade não pode estar vazio.");
    }
  }
}
