import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { BairroEntity } from "../../domain/models/bairro.entity";
import {
  BAIRRO_REPOSITORY,
  type BairroRepository,
} from "../../domain/repositories/bairro.repository";
import { CreateBairroDto } from "../dto/create-bairro.dto";
import { UpdateBairroDto } from "../dto/update-bairro.dto";

@Injectable()
export class BairroService {
  constructor(
    @Inject(BAIRRO_REPOSITORY)
    private readonly bairroRepository: BairroRepository,
  ) {}

  async save(data: CreateBairroDto): Promise<BairroEntity> {
    return this.bairroRepository.save({
      nome: this.normalizeNome(data.nome),
      idCidade: this.parseBigInt(data.idCidade),
    });
  }

  async findById(idBairro: bigint | string): Promise<BairroEntity | null> {
    return this.bairroRepository.findById(this.parseBigInt(idBairro));
  }

  async findMany(idCidade?: bigint | string): Promise<BairroEntity[]> {
    return this.bairroRepository.findMany(
      idCidade === undefined ? undefined : this.parseBigInt(idCidade),
    );
  }

  async updateById(
    idBairro: bigint | string,
    input: UpdateBairroDto,
  ): Promise<BairroEntity> {
    const parsedId = this.parseBigInt(idBairro);
    const existente = await this.bairroRepository.findById(parsedId);

    if (!existente) {
      throw new NotFoundException("Bairro não encontrado.");
    }

    const bairro = await this.bairroRepository.update(parsedId, {
      nome:
        input.nome === undefined ? undefined : this.normalizeNome(input.nome),
      idCidade:
        input.idCidade === undefined
          ? undefined
          : this.parseBigInt(input.idCidade),
    });

    if (!bairro) {
      throw new NotFoundException("Bairro não encontrado.");
    }

    return bairro;
  }

  async removeById(idBairro: bigint | string): Promise<void> {
    const removed = await this.bairroRepository.remove(
      this.parseBigInt(idBairro),
    );

    if (!removed) {
      throw new NotFoundException("Bairro não encontrado.");
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
      throw new BadRequestException("Nome do bairro não pode estar vazio.");
    }

    return normalizedNome;
  }
}
