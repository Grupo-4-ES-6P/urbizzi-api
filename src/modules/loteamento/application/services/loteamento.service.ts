import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CAMPOS_DETALHES,
  type LoteamentoDetalhes,
  type LoteamentoEntity,
} from "../../domain/models/loteamento.entity";
import type { LoteamentoDetalhesDto } from "../dto/loteamento-detalhes.dto";
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
      descricao: data.descricao?.trim() ?? "",
      situacao: this.requiredText(data.situacao, "Situação"),
      publicado: data.publicado ?? false,
      idBairro: data.idBairro == null ? null : this.bairroId(data.idBairro),
      ...this.detalhes(data),
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
      descricao: data.descricao === undefined ? undefined : data.descricao.trim(),
      situacao:
        data.situacao === undefined
          ? undefined
          : this.requiredText(data.situacao, "Situação"),
      publicado: data.publicado,
      idBairro:
        data.idBairro === undefined
          ? undefined
          : data.idBairro === null
            ? null
            : this.bairroId(data.idBairro),
      ...this.detalhes(data),
    });
    if (!atualizado) throw new NotFoundException("Loteamento não encontrado.");
    return atualizado;
  }

  async removeById(id: string): Promise<void> {
    const removed = await this.repository.remove(this.parseId(id));
    if (!removed) throw new NotFoundException("Loteamento não encontrado.");
  }

  /** Só inclui o que veio no corpo: ausente mantém, null apaga. */
  private detalhes(data: LoteamentoDetalhesDto): Partial<LoteamentoDetalhes> {
    const saida: Partial<Record<keyof LoteamentoDetalhes, unknown>> = {};
    for (const campo of CAMPOS_DETALHES) {
      const valor = data[campo];
      if (valor === undefined) continue;
      saida[campo] = typeof valor === "string" ? valor.trim() || null : valor;
    }
    if (typeof saida.cep === "string") saida.cep = saida.cep.replace(/\D/g, "") || null;
    if (typeof saida.uf === "string") saida.uf = saida.uf.toUpperCase();
    return saida as Partial<LoteamentoDetalhes>;
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
