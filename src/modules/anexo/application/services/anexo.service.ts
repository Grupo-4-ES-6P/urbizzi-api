import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AnexoEntity } from "../../domain/models/anexo.entity";
import {
  ANEXO_REPOSITORY,
  type AnexoRepository,
  type AtualizarAnexoInput,
} from "../../domain/repositories/anexo.repository";
import type { CreateAnexoDto } from "../dto/create-anexo.dto";
import type { UpdateAnexoDto } from "../dto/update-anexo.dto";

export const TIPOS_ARQUIVO_PERMITIDOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

@Injectable()
export class AnexoService {
  constructor(
    @Inject(ANEXO_REPOSITORY)
    private readonly repository: AnexoRepository,
  ) {}

  async save(data: CreateAnexoDto): Promise<AnexoEntity> {
    return this.repository.save({
      tipoArquivo: this.tipoArquivo(data.tipoArquivo),
      caminhoArquivo: this.caminhoArquivo(data.caminhoArquivo),
    });
  }

  async findById(id: string): Promise<AnexoEntity> {
    const anexo = await this.repository.findById(this.parseId(id));
    if (!anexo) throw new NotFoundException("Anexo não encontrado.");
    return anexo;
  }

  findMany(): Promise<AnexoEntity[]> {
    return this.repository.findMany();
  }

  async updateById(id: string, data: UpdateAnexoDto): Promise<AnexoEntity> {
    const parsedId = this.parseId(id);

    const input: AtualizarAnexoInput = {};
    if (data.tipoArquivo !== undefined)
      input.tipoArquivo = this.tipoArquivo(data.tipoArquivo);
    if (data.caminhoArquivo !== undefined)
      input.caminhoArquivo = this.caminhoArquivo(data.caminhoArquivo);

    if (Object.keys(input).length === 0) return this.findById(id);

    const atualizado = await this.repository.update(parsedId, input);
    if (!atualizado) throw new NotFoundException("Anexo não encontrado.");
    return atualizado;
  }

  async removeById(id: string): Promise<void> {
    const removed = await this.repository.remove(this.parseId(id));
    if (!removed) throw new NotFoundException("Anexo não encontrado.");
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

  private tipoArquivo(value: string): string {
    const normalized = value?.trim().toLowerCase();
    if (
      !normalized ||
      !(TIPOS_ARQUIVO_PERMITIDOS as readonly string[]).includes(normalized)
    ) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido. Use: ${TIPOS_ARQUIVO_PERMITIDOS.join(", ")}.`,
      );
    }
    return normalized;
  }

  private caminhoArquivo(value: string): string {
    const normalized = value?.trim();
    if (!normalized)
      throw new BadRequestException("Caminho do arquivo não pode estar vazio.");
    if (
      normalized.length > 2048 ||
      normalized.includes("\0") ||
      normalized.split(/[\\/]/).includes("..")
    ) {
      throw new BadRequestException("Caminho do arquivo inválido.");
    }
    return normalized;
  }
}
