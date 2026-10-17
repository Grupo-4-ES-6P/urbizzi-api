import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { LogradouroEntity } from "../../domain/models/logradouro.entity";
import {
  LOGRADOURO_REPOSITORY,
  type LogradouroRepository,
} from "../../domain/repositories/logradouro.repository";
import { CreateLogradouroDto } from "../dto/create-logradouro.dto";
import { UpdateLogradouroDto } from "../dto/update-logradouro.dto";

@Injectable()
export class LogradouroService {
  constructor(
    @Inject(LOGRADOURO_REPOSITORY)
    private readonly logradouroRepository: LogradouroRepository,
  ) {}

  async save(data: CreateLogradouroDto): Promise<LogradouroEntity> {
    return this.logradouroRepository.save({
      nome: this.normalizeNome(data.nome),
      idCidade: this.parseBigInt(data.idCidade),
    });
  }

  async findById(
    idLogradouro: bigint | string,
  ): Promise<LogradouroEntity | null> {
    return this.logradouroRepository.findById(this.parseBigInt(idLogradouro));
  }

  async findMany(idCidade?: bigint | string): Promise<LogradouroEntity[]> {
    return this.logradouroRepository.findMany(
      idCidade === undefined ? undefined : this.parseBigInt(idCidade),
    );
  }

  async updateById(
    idLogradouro: bigint | string,
    input: UpdateLogradouroDto,
  ): Promise<LogradouroEntity> {
    const parsedId = this.parseBigInt(idLogradouro);
    const existente = await this.logradouroRepository.findById(parsedId);

    if (!existente) {
      throw new NotFoundException("Logradouro não encontrado.");
    }

    const logradouro = await this.logradouroRepository.update(parsedId, {
      nome:
        input.nome === undefined ? undefined : this.normalizeNome(input.nome),
      idCidade:
        input.idCidade === undefined
          ? undefined
          : this.parseBigInt(input.idCidade),
    });

    if (!logradouro) {
      throw new NotFoundException("Logradouro não encontrado.");
    }

    return logradouro;
  }

  async removeById(idLogradouro: bigint | string): Promise<void> {
    const removed = await this.logradouroRepository.remove(
      this.parseBigInt(idLogradouro),
    );

    if (!removed) {
      throw new NotFoundException("Logradouro não encontrado.");
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
      throw new BadRequestException(
        "Nome do logradouro não pode estar vazio.",
      );
    }

    return normalizedNome;
  }
}
