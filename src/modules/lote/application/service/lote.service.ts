import { CreateLoteDto } from "@modules/lote/application/dto/lote-create.dto";
import { LoteBuilder } from "@modules/lote/domain/builder/lote.builder";
import type { Lote } from "@modules/lote/domain/model/lote.entity";
import {
    LOTE_REPOSITORY,
    type FiltroLotes,
    type LoteRepository,
} from "@modules/lote/domain/repository/lote.repository.interface";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ResponseLoteDto } from "../dto/lote-response.dto";
import { UpdateLoteDto } from "../dto/lote-update.dto";

const opcionalBigInt = (valor?: number | null) => (valor == null ? null : BigInt(valor));

@Injectable()
export class LoteService {
    constructor(
        @Inject(LOTE_REPOSITORY)
        private readonly loteRepository: LoteRepository,
    ) {}

    async create(dto: CreateLoteDto): Promise<ResponseLoteDto> {
        const matricula = dto.matricula?.trim() || null;
        await this.validarMatricula(matricula);

        const lote = new LoteBuilder()
            .withMatricula(matricula)
            .withTipo(dto.tipo.trim())
            .withAreaQuadrada(dto.areaQuadrada)
            .withValor(dto.valor)
            .withEstado(dto.estado)
            .withInformacoesComplementares(dto.informacoesComplementares?.trim() || null)
            .withLatitude(dto.latitude)
            .withLongitude(dto.longitude)
            .withPublicado(dto.publicado)
            .withIdQuadra(opcionalBigInt(dto.idQuadra))
            .withIdLogradouro(opcionalBigInt(dto.idLogradouro))
            .withIdAnexo(opcionalBigInt(dto.idAnexo))
            .withDetalhes(dto.detalhes)
            .build();

        return this.toResponse(await this.loteRepository.create(lote));
    }

    /** Campo ausente mantém o valor; null apaga. */
    async update(id: string, dto: UpdateLoteDto): Promise<ResponseLoteDto> {
        const parsedId = this.parseBigInt(id, "id");
        const atual = await this.loteRepository.findById(parsedId);
        if (!atual) throw new NotFoundException("Lote não encontrado");

        const escolher = <T>(novo: T | undefined, anterior: T) => (novo === undefined ? anterior : novo);
        const matricula = dto.matricula === undefined ? atual.matricula : dto.matricula?.trim() || null;
        await this.validarMatricula(matricula, parsedId);

        const lote = new LoteBuilder(parsedId)
            .withMatricula(matricula)
            .withTipo(dto.tipo?.trim() || atual.tipo)
            .withAreaQuadrada(escolher(dto.areaQuadrada, atual.areaQuadrada))
            .withValor(escolher(dto.valor, atual.valor))
            .withEstado(dto.estado ?? atual.estado)
            .withInformacoesComplementares(escolher(dto.informacoesComplementares, atual.informacoesComplementares))
            .withLatitude(escolher(dto.latitude, atual.latitude))
            .withLongitude(escolher(dto.longitude, atual.longitude))
            .withPublicado(dto.publicado ?? atual.publicado)
            .withIdQuadra(dto.idQuadra === undefined ? atual.idQuadra : opcionalBigInt(dto.idQuadra))
            .withIdLogradouro(dto.idLogradouro === undefined ? atual.idLogradouro : opcionalBigInt(dto.idLogradouro))
            .withIdAnexo(dto.idAnexo === undefined ? atual.idAnexo : opcionalBigInt(dto.idAnexo))
            .withDetalhes(dto.detalhes ?? atual.detalhes)
            .withCreatedAt(atual.createdAt)
            .build();

        const salvo = await this.loteRepository.update(lote);
        if (!salvo) throw new NotFoundException("Lote não encontrado");
        return this.toResponse(salvo);
    }

    async delete(id: string): Promise<void> {
        const parsedId = this.parseBigInt(id, "id");
        if (!(await this.loteRepository.findById(parsedId))) throw new NotFoundException("Lote não encontrado");
        await this.loteRepository.delete(parsedId);
    }

    async findAll(filtro: { idQuadra?: string; idLogradouro?: string; matricula?: string } = {}): Promise<ResponseLoteDto[]> {
        const filtroRepo: FiltroLotes = {
            idQuadra: filtro.idQuadra ? this.parseBigInt(filtro.idQuadra, "idQuadra") : undefined,
            idLogradouro: filtro.idLogradouro ? this.parseBigInt(filtro.idLogradouro, "idLogradouro") : undefined,
            matricula: filtro.matricula?.trim() || undefined,
        };
        const lotes = await this.loteRepository.findAll(filtroRepo);
        return lotes.map((lote) => this.toResponse(lote));
    }

    async findById(id: string): Promise<ResponseLoteDto> {
        const lote = await this.loteRepository.findById(this.parseBigInt(id, "id"));
        if (!lote) throw new NotFoundException("Lote não encontrado");
        return this.toResponse(lote);
    }

    private async validarMatricula(matricula: string | null, ignorarId?: bigint) {
        if (!matricula) return;
        const existente = await this.loteRepository.findByMatricula(matricula);
        if (existente && existente.id !== ignorarId) {
            throw new ConflictException("Lote com essa matrícula já existente");
        }
    }

    private toResponse(lote: Lote): ResponseLoteDto {
        return {
            id: lote.id!.toString(),
            matricula: lote.matricula,
            tipo: lote.tipo,
            areaQuadrada: lote.areaQuadrada,
            valor: lote.valor,
            estado: lote.estado,
            informacoesComplementares: lote.informacoesComplementares,
            latitude: lote.latitude,
            longitude: lote.longitude,
            publicado: lote.publicado,
            idQuadra: lote.idQuadra?.toString() ?? null,
            idLogradouro: lote.idLogradouro?.toString() ?? null,
            idAnexo: lote.idAnexo?.toString() ?? null,
            detalhes: lote.detalhes,
            createdAt: lote.createdAt.toISOString(),
            updatedAt: lote.updatedAt.toISOString(),
        };
    }

    private parseBigInt(value: string, fieldName: string): bigint {
        const normalizedValue = value.trim();
        if (!/^\d+$/.test(normalizedValue)) throw new BadRequestException(`${fieldName} inválido.`);
        return BigInt(normalizedValue);
    }
}
