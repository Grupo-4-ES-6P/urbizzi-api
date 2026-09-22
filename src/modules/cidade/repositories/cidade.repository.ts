import { Cidade } from "../entities/cidade.entity";

export type CidadeRepositoryData = Omit<Cidade, "idCidade">;

export interface CidadeRepository {
  create(data: CidadeRepositoryData): Promise<Cidade>;
  findById(idCidade: number): Promise<Cidade | null>;
  findAll(): Promise<Cidade[]>;
  update(idCidade: number, data: CidadeRepositoryData): Promise<Cidade | null>;
  delete(idCidade: number): Promise<boolean>;
}
