import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CidadeEntity } from "../../domain/models/cidade.entity";
import {
  CIDADE_REPOSITORY,
  type CidadeRepository,
} from "../../domain/repositories/cidade.repository";
import { CreateCidadeDto } from "../dto/create-cidade.dto";
import { UpdateCidadeDto } from "../dto/update-cidade.dto";

@Injectable()
export class CidadeService {
  constructor(
    @Inject(CIDADE_REPOSITORY)
    private readonly cidadeRepository: CidadeRepository,
  ) {}

  async save(data: CreateCidadeDto): Promise<CidadeEntity> {
    return this.cidadeRepository.save({
      nome: this.normalizeNome(data.nome),
    });
  }

  async findById(idCidade: bigint | string): Promise<CidadeEntity | null> {
    return this.cidadeRepository.findById(this.parseBigInt(idCidade));
  }

  async findMany(): Promise<CidadeEntity[]> {
    return this.cidadeRepository.findMany();
  }

  async updateById(
    idCidade: bigint | string,
    input: UpdateCidadeDto,
  ): Promise<CidadeEntity> {
    const parsedId = this.parseBigInt(idCidade);
    const existente = await this.cidadeRepository.findById(parsedId);

    if (!existente) {
      throw new NotFoundException("Cidade não encontrada.");
    }

    const cidade = await this.cidadeRepository.update(parsedId, {
      nome: input.nome === undefined ? undefined : this.normalizeNome(input.nome),
    });

    if (!cidade) {
      throw new NotFoundException("Cidade não encontrada.");
    }

    return cidade;
  }

  async removeById(idCidade: bigint | string): Promise<void> {
    const removed = await this.cidadeRepository.remove(
      this.parseBigInt(idCidade),
    );

    if (!removed) {
      throw new NotFoundException("Cidade não encontrada.");
    }
  }

  private parseBigInt(value: string | bigint): bigint {
    if (typeof value === "bigint") {
      return value;
    }

    const normalizedValue = value.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      throw new BadRequestException("Identificador inválido.");
    }

    return BigInt(normalizedValue);
  }

  private normalizeNome(nome: string): string {
    const normalizedNome = nome.trim();

    if (!normalizedNome) {
      throw new BadRequestException("Nome da cidade não pode estar vazio.");
    }

    return normalizedNome;
  }
}
