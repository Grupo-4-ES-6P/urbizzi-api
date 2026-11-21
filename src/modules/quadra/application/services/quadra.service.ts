import { CreateQuadraDto } from "@modules/quadra/application/dtos/quadra-create.dto";
import { UpdateQuadraDto } from "@modules/quadra/application/dtos/quadra-update.dto";
import type { ResponseQuadraDto } from "@modules/quadra/application/dtos/quadra-response.dto";
import { Quadra } from "@modules/quadra/domain/models/quadra.entity";
import { QuadraBuilder } from "@modules/quadra/domain/builders/quadra.builder";
import {
    QUADRA_REPOSITORY,
    type QuadraRepository
} from "@modules/quadra/domain/repositories/quadra.repository.interface";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { NotContains } from "class-validator";

export interface QuadraPayload {
    id: bigint;
    identificacao: string;
    idLoteamento: bigint;
}

@Injectable()
export class QuadraService {
    
    constructor(
        @Inject(QUADRA_REPOSITORY)
        private readonly quadraRepository: QuadraRepository,
    ) {}

    async create(dto: CreateQuadraDto): Promise<ResponseQuadraDto> {
        const exists = await this.quadraRepository.findByIdentificacao(dto.identificacao);
        if (exists) throw new ConflictException("Quadra com essa identificaão já existe");

        const quadra = new QuadraBuilder()
            .withIdentificacao(dto.identificacao)
            .withIdLoteamento(dto.idLoteamento)
            .build();
        
        await this.quadraRepository.create(quadra);

        const saved = await this.quadraRepository.findByIdentificacao(dto.identificacao);
        if (!saved) throw new NotFoundException("Não foi possível salvar a quadra");

        return this.toResponse(saved);
    }

    async update(id: string, dto: UpdateQuadraDto): Promise<ResponseQuadraDto> {
        const parsedId = this.parseBigInt(id, "id");
        const currentQuadra = await this.quadraRepository.findById(parsedId);
        if (!currentQuadra) throw new NotFoundException("Quadra não encontrada");

        if (dto.identificacao !== undefined) {
            const exists = await this.quadraRepository.findByIdentificacao(dto.identificacao!);
            if (exists) throw new ConflictException("Quadra com essa identificaão já existe");
        }

        const updatedQuadra = new QuadraBuilder(parsedId)
            .withIdentificacao(dto.identificacao??currentQuadra.identificacao!.toString())
            .withIdLoteamento(dto.idLoteamento)
            .withCreatedAt(currentQuadra.createdAt)
            .withUpdatedAt(new Date())
            .build();

        if(!updatedQuadra) throw new InternalServerErrorException("Erro ao atualizar quadra");

        await this.quadraRepository.update(updatedQuadra)

        const saved = await this.quadraRepository.findById(parsedId);
        if (!saved) throw new NotFoundException("Não foi possível salvar a quadra");

        return this.toResponse(saved);
    }

    async delete(id: string): Promise<Boolean> {
        const parsedId = this.parseBigInt(id, "id");
        const quadra = await this.quadraRepository.findById(parsedId);
        if (!quadra) throw new NotFoundException("Quadra não encontrada");

        await this.quadraRepository.delete(parsedId);

        const deletedQuadra = await this.quadraRepository.findById(parsedId);
        if(deletedQuadra) throw new InternalServerErrorException("Erro ao apagar a quadra")

        return true;
    }

    async findAll(): Promise<ResponseQuadraDto[]> {
        const quadras = await this.quadraRepository.findAll();

        return quadras.map((quadra) => this.toResponse(quadra));
    }

    async findById(id: string): Promise<ResponseQuadraDto> {
        const parsedId = this.parseBigInt(id, "id");
        const quadra = await this.quadraRepository.findById(parsedId);
        if (!quadra) throw new NotFoundException("Quadra não encontrada");

        return this.toResponse(quadra);
    }

    async findByIdentificacao(identificacao: string) {
        const quadra = await this.quadraRepository.findByIdentificacao(identificacao);
        if (!quadra) throw new NotFoundException("Quadra não encontrada");

        return this.toResponse(quadra);
    }

    async findByLoteamento(idLoteamento: string) {
        const parsedId = this.parseBigInt(idLoteamento, "idLoteamento");
        const quadras = await this.quadraRepository.findByLoteamento(parsedId);

        return quadras.map((quadra) => this.toResponse(quadra));
    }

    // common
    
    private toResponse(quadra: Quadra): ResponseQuadraDto {
        return {
            id: quadra.id!.toString(),
            identificacao: quadra.identificacao!.toString(),
            idLoteamento: quadra.idLoteamento!.toString(),
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