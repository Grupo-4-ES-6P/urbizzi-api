import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PropostaEntity } from "../../domain/models/proposta.entity";
import {
  type AtualizarPropostaInput,
  PROPOSTA_REPOSITORY,
  type PropostaRepository,
} from "../../domain/repositories/proposta.repository";
import type { CreatePropostaDto } from "../dto/create-proposta.dto";
import type { UpdatePropostaDto } from "../dto/update-proposta.dto";

@Injectable()
export class PropostaService {
  constructor(
    @Inject(PROPOSTA_REPOSITORY)
    private readonly repository: PropostaRepository,
  ) {}

  async save(
    data: CreatePropostaDto,
    usuarioId: string,
  ): Promise<PropostaEntity> {
    return this.repository.save({
      valor: this.decimal(data.valor),
      condicoes: this.requiredText(data.condicoes, "Condições"),
      observacoes: this.optionalText(data.observacoes),
      status: this.requiredText(data.status, "Status"),
      justificativa: this.optionalText(data.justificativa),
      prazoResposta: this.optionalDate(data.prazoResposta),
      idLote: this.parseId(data.idLote),
      idUsuario: this.parseId(usuarioId),
      idCliente: this.parseId(data.idCliente),
    });
  }

  async findById(id: string): Promise<PropostaEntity> {
    const proposta = await this.repository.findById(this.parseId(id));
    if (!proposta) throw new NotFoundException("Proposta não encontrada.");
    return proposta;
  }

  findMany(): Promise<PropostaEntity[]> {
    return this.repository.findMany();
  }

  async updateById(
    id: string,
    data: UpdatePropostaDto,
  ): Promise<PropostaEntity> {
    const parsedId = this.parseId(id);
    const existente = await this.repository.findById(parsedId);
    if (!existente) throw new NotFoundException("Proposta não encontrada.");

    const input: AtualizarPropostaInput = {};
    if (data.valor !== undefined) input.valor = this.decimal(data.valor);
    if (data.condicoes !== undefined)
      input.condicoes = this.requiredText(data.condicoes, "Condições");
    if (data.observacoes !== undefined)
      input.observacoes = this.optionalText(data.observacoes);
    if (data.status !== undefined)
      input.status = this.requiredText(data.status, "Status");
    if (data.justificativa !== undefined)
      input.justificativa = this.optionalText(data.justificativa);
    if (data.prazoResposta !== undefined)
      input.prazoResposta = this.optionalDate(data.prazoResposta);
    if (data.idLote !== undefined) input.idLote = this.parseId(data.idLote);
    if (data.idCliente !== undefined)
      input.idCliente = this.parseId(data.idCliente);

    if (Object.keys(input).length === 0) return existente;

    const atualizado = await this.repository.update(
      parsedId,
      existente.versao,
      input,
    );
    if (!atualizado)
      throw new ConflictException(
        "Proposta alterada por outro usuário. Consulte a versão atual.",
      );
    return atualizado;
  }

  async removeById(id: string): Promise<void> {
    const removed = await this.repository.remove(this.parseId(id));
    if (!removed) throw new NotFoundException("Proposta não encontrada.");
  }

  private parseId(value: string | number): number {
    const text = String(value);
    if (!/^\d+$/.test(text))
      throw new BadRequestException("Identificador inválido.");
    const id = Number(text);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      throw new BadRequestException("Identificador inválido.");
    }
    return id;
  }

  private decimal(value: string): string {
    const normalized = value?.trim();
    if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) {
      throw new BadRequestException("Valor da proposta inválido.");
    }
    return normalized;
  }

  private requiredText(value: string, field: string): string {
    const normalized = value?.trim();
    if (!normalized)
      throw new BadRequestException(`${field} não pode estar vazio.`);
    return normalized;
  }

  private optionalText(value: string | null | undefined): string | null {
    return value == null ? null : value.trim();
  }

  private optionalDate(value: string | null | undefined): Date | null {
    if (value == null) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException("Prazo de resposta inválido.");
    return date;
  }
}
