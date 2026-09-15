import { Cidade } from "../entities/cidade.entity";
import type { CidadeRepository } from "./cidade.repository";

export class InMemoryCidadeRepository implements CidadeRepository {
  private cidades = new Map<number, Cidade>();
  private nextId = 1;

  async create(data: Omit<Cidade, "idCidade">): Promise<Cidade> {
    const cidade = new Cidade(this.nextId, data.nome);

    this.cidades.set(cidade.idCidade, cidade);
    this.nextId += 1;

    return cidade;
  }

  async findById(idCidade: number): Promise<Cidade | null> {
    return this.cidades.get(idCidade) ?? null;
  }

  async findAll(): Promise<Cidade[]> {
    return Array.from(this.cidades.values());
  }

  async update(idCidade: number, data: Omit<Cidade, "idCidade">): Promise<Cidade | null> {
    if (!this.cidades.has(idCidade)) {
      return null;
    }

    const cidade = new Cidade(idCidade, data.nome);
    this.cidades.set(idCidade, cidade);

    return cidade;
  }

  async delete(idCidade: number): Promise<boolean> {
    return this.cidades.delete(idCidade);
  }

  clear(): void {
    this.cidades.clear();
    this.nextId = 1;
  }
}
