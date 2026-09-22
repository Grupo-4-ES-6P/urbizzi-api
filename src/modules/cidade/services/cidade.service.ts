import { HttpError } from "../../../shared/errors/http-error";
import type { Cidade } from "../entities/cidade.entity";
import type { CidadeRepository } from "../repositories/cidade.repository";
import { validateCidadeInput } from "../schemas/cidade.schema";

export class CidadeService {
  constructor(private readonly cidadeRepository: CidadeRepository) {}

  async create(data: unknown): Promise<Cidade> {
    const cidadeData = this.validate(data);

    return this.cidadeRepository.create(cidadeData);
  }

  async findById(idCidade: number): Promise<Cidade> {
    this.validateId(idCidade);

    const cidade = await this.cidadeRepository.findById(idCidade);

    if (!cidade) {
      throw new HttpError(404, "Cidade não encontrada.");
    }

    return cidade;
  }

  async findAll(): Promise<Cidade[]> {
    return this.cidadeRepository.findAll();
  }

  async update(idCidade: number, data: unknown): Promise<Cidade> {
    this.validateId(idCidade);
    const cidadeData = this.validate(data);

    const cidade = await this.cidadeRepository.update(idCidade, cidadeData);

    if (!cidade) {
      throw new HttpError(404, "Cidade não encontrada.");
    }

    return cidade;
  }

  async delete(idCidade: number): Promise<void> {
    this.validateId(idCidade);

    const deleted = await this.cidadeRepository.delete(idCidade);

    if (!deleted) {
      throw new HttpError(404, "Cidade não encontrada.");
    }
  }

  private validate(data: unknown): { nome: string } {
    const result = validateCidadeInput(data);

    if (result.error || !result.data) {
      throw new HttpError(400, result.error ?? "Dados da cidade inválidos.");
    }

    return result.data;
  }

  private validateId(idCidade: number): void {
    if (!Number.isInteger(idCidade) || idCidade <= 0) {
      throw new HttpError(400, "Identificador da cidade inválido.");
    }
  }
}
