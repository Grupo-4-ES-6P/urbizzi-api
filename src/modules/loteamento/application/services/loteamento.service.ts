import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { LoteamentoEntity } from "../../domain/models/loteamento.entity";
import {
  LOTEAMENTO_REPOSITORY,
  type LoteamentoRepository,
} from "../../domain/repositories/loteamento.repository";
import type { CreateLoteamentoDto } from "../dto/create-loteamento.dto";
import type { UpdateLoteamentoDto } from "../dto/update-loteamento.dto";

@Injectable()
export class LoteamentoService {
  constructor(
    @Inject(LOTEAMENTO_REPOSITORY)
    private readonly repository: LoteamentoRepository,
  ) {}

  async save(data: CreateLoteamentoDto): Promise<LoteamentoEntity> {
    return this.repository.save({
      nome: this.requiredText(data.nome, "Nome"),
      descricao: this.requiredText(data.descricao, "Descrição"),
      situacao: this.requiredText(data.situacao, "Situação"),
      publicado: data.publicado,
      idBairro: this.bairroId(data.idBairro),
    });
  }

  async findById(id: string): Promise<LoteamentoEntity> {
    const loteamento = await this.repository.findById(this.parseId(id));
    if (!loteamento) throw new NotFoundException("Loteamento não encontrado.");
    return loteamento;
  }

  findMany(): Promise<LoteamentoEntity[]> {
    return this.repository.findMany();
  }

  async updateById(
    id: string,
    data: UpdateLoteamentoDto,
  ): Promise<LoteamentoEntity> {
    const parsedId = this.parseId(id);
    const existente = await this.repository.findById(parsedId);
    if (!existente) throw new NotFoundException("Loteamento não encontrado.");

    const atualizado = await this.repository.update(parsedId, {
      nome:
        data.nome === undefined
          ? undefined
          : this.requiredText(data.nome, "Nome"),
      descricao:
        data.descricao === undefined
          ? undefined
          : this.requiredText(data.descricao, "Descrição"),
      situacao:
        data.situacao === undefined
          ? undefined
          : this.requiredText(data.situacao, "Situação"),
      publicado: data.publicado,
      idBairro:
        data.idBairro === undefined ? undefined : this.bairroId(data.idBairro),
    });
    if (!atualizado) throw new NotFoundException("Loteamento não encontrado.");
    return atualizado;
  }

  async removeById(id: string): Promise<void> {
    const removed = await this.repository.remove(this.parseId(id));
    if (!removed) throw new NotFoundException("Loteamento não encontrado.");
  }

  private parseId(id: string): number {
    if (!/^\d+$/.test(id))
      throw new BadRequestException("Identificador inválido.");
    const parsed = Number(id);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2147483647) {
      throw new BadRequestException("Identificador inválido.");
    }
    return parsed;
  }

  private bairroId(id: number): number {
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      throw new BadRequestException("Bairro inválido.");
    }
    return id;
  }

  private requiredText(value: string, field: string): string {
    const normalized = value?.trim();
    if (!normalized)
      throw new BadRequestException(`${field} não pode estar vazio.`);
    return normalized;
  }
}
