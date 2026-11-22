import { CreateLoteDto } from "@modules/lote/application/dto/lote-create.dto";
import { UpdateLoteDto } from "../dto/lote-update.dto";
import { ResponseLoteDto } from "../dto/lote-response.dto";
import { Lote } from "@modules/lote/domain/model/lote.entity";
import { LoteBuilder } from "@modules/lote/domain/builder/lote.builder";
import {
    LOTE_REPOSITORY,
    type LoteRepository 
} from "@modules/lote/domain/repository/lote.repository.interface";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

@Injectable()
export class LoteService {

    constructor(
        @Inject(LOTE_REPOSITORY)
        private readonly loteReposirory: LoteRepository
    ) {}

    async create(dto: CreateLoteDto): Promise<ResponseLoteDto> {
        const exists = await this.loteReposirory.findByMatricula(dto.matricula??"")
        if(exists) throw new ConflictException("Lote com essa matrícula já existente");

        const lote = new LoteBuilder(undefined, dto.idQuadra, dto.idLogradouro)
            .withMatricula(dto.matricula)
            .withTipo(dto.tipo)
            .withAreaQuadrada(dto.areaQuadrada)
            .withValor(dto.valor)
            .withEstado(dto.estado)
            .withInformacoesComplementares(dto.informacoesComplementares)
            .withLatitude(dto.latitude)
            .withLongitude(dto.longitude)
            .withPublicado(dto.publicado)
            .withIdQuadra(dto.idQuadra)
            .withIdLogradouro(dto.idLogradouro)
            .withIdAnexo(dto.idAnexo)
            .build()
        
        await this.loteReposirory.create(lote);

        return this.toResponse(lote);    
    }

    async update(id: string, dto: UpdateLoteDto): Promise<ResponseLoteDto> {
        const parsedId = this.parseBigInt(id, "id");
        const current = await this.loteReposirory.findById(parsedId);

        if (!current) throw new NotFoundException("Lote não encontrado");

        if (dto.matricula !== undefined) {
            const exists = await this.loteReposirory.findByMatricula(dto.matricula!);
            if (exists) throw new ConflictException("Lote com essa matrícula já existente");
        }

        const updatedLote = new LoteBuilder(
            parsedId, 
            dto.idQuadra ?? current.idQuadra, 
            dto.idLogradouro ?? current.idLogradouro)
            .withMatricula(dto.matricula ?? current.matricula)
            .withTipo(dto.tipo ?? current.tipo!)
            .withAreaQuadrada(dto.areaQuadrada ?? current.areaQuadrada!)
            .withValor(dto.valor ?? current.valor!)
            .withEstado(dto.estado ?? current.estado!)
            .withInformacoesComplementares(dto.informacoesComplementares ?? current.informacoesComplementares!)
            .withLatitude(dto.latitude ?? current.latitude!)
            .withLongitude(dto.longitude ?? current.longitude!)
            .withPublicado(dto.publicado ?? current.publicado!)
            .withIdAnexo(dto.idAnexo ?? current.idAnexo)
            .build();
        
        await this.loteReposirory.update(updatedLote);

        const updated = await this.loteReposirory.findById(parsedId);
        if (updated === current || updated === null) throw new InternalServerErrorException("Erro ao atualizar o lote");

        return this.toResponse(updated);
    }

    async delete(id: string): Promise<boolean> {
        const parsedId = this.parseBigInt(id, "id");
        const lote = await this.loteReposirory.findById(parsedId);
        if (!lote) throw new  NotFoundException("Lote não encontrado");

        await this.loteReposirory.delete(parsedId);

        const deletedLote = await this.loteReposirory.findById(parsedId);
        if (deletedLote) throw new InternalServerErrorException("Erro ao apagar o lote");

        return true;
    }

    async findAll(): Promise<ResponseLoteDto[]> {
        const lotes = await this.loteReposirory.findAll();

        return lotes.map((lote) => this.toResponse(lote));
    }

    async findById(id: string): Promise<ResponseLoteDto> {
        const parsedId = this.parseBigInt(id, "id");
        const lote = await this.loteReposirory.findById(parsedId);
        if (!lote) throw new NotFoundException("Lote não encontrado");

        return this.toResponse(lote);
    }

    async findByMatricula(matricula: string): Promise<ResponseLoteDto> {
        const lote = await this.loteReposirory.findByMatricula(matricula);
        if (!lote) throw new NotFoundException("Lote não encontrado");
        
        return this.toResponse(lote);
    }

    async findByQuadra(idQuadra: string): Promise<ResponseLoteDto[]> {
        const parsedId = this.parseBigInt(idQuadra, "idQuadra");
        const lotes = await this.loteReposirory.findByQuadra(parsedId);
        
        return lotes.map((lote) => this.toResponse(lote));
    }

    async findByLogradouro(idLogradouro: string): Promise<ResponseLoteDto[]> {
        const parsedId = this.parseBigInt(idLogradouro, "idLogradouro");
        const lotes = await this.loteReposirory.findByLogradouro(parsedId);

        return lotes.map((lote) => this.toResponse(lote));
    }

    // common
        
    private toResponse(lote: Lote): ResponseLoteDto {
        return {
            id: lote.id!.toString(),
            matricula: lote.matricula?.toString(),
            tipo: lote.tipo!.toString(),
            areaQuadrada: lote.areaQuadrada!,
            valor: lote.valor!,
            estado: lote.estado!.toString(),
            informacoesComplementares: lote.informacoesComplementares?.toString(),
            latitude: lote.latitude!,
            longitude: lote.longitude!,
            publicado: lote.publicado!,
            idQuadra: lote.idQuadra.toString(),
            idLogradouro: lote.idLogradouro.toString(),
            idAnexo: lote.idAnexo?.toLocaleString(),
            createdAt: lote.createdAt!.toDateString(),
            updatedAt: lote.updatedAt!.toDateString()
        };
    }

    private parseBigInt(value: string, fieldName: string): bigint {
    const normalizedValue = value.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      throw new BadRequestException(`${fieldName} inválido.`);
    }

    return BigInt(normalizedValue);
    }

}