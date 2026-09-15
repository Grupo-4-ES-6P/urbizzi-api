import { Cidade } from "../entities/cidade.entity";

export interface CidadeRepository {
  create(data: Omit<Cidade, "idCidade">): Promise<Cidade>;
  findById(idCidade: number): Promise<Cidade | null>;
  findAll(): Promise<Cidade[]>;
  update(idCidade: number, data: Omit<Cidade, "idCidade">): Promise<Cidade | null>;
  delete(idCidade: number): Promise<boolean>;
}
