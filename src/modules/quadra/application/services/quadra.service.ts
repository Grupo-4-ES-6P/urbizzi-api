import { CreateQuadraDto } from "@modules/quadra/application/dtos/quadra-create.dto";
import type { ResponseQuadraDto } from "@modules/quadra/application/dtos/quadra-response.dto";
import { UpdateQuadraDto } from "@modules/quadra/application/dtos/quadra-update.dto";
import { QuadraBuilder } from "@modules/quadra/domain/builders/quadra.builder";
import type { Quadra } from "@modules/quadra/domain/models/quadra.entity";
import {
    QUADRA_REPOSITORY,
    type QuadraRepository,
} from "@modules/quadra/domain/repositories/quadra.repository.interface";
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

@Injectable()
export class QuadraService {
    constructor(
        @Inject(QUADRA_REPOSITORY)
        private readonly quadraRepository: QuadraRepository,
    ) {}

    async create(dto: CreateQuadraDto): Promise<ResponseQuadraDto> {
        const idLoteamento = BigInt(dto.idLoteamento);
        const identificacao = this.identificacao(dto.identificacao);
        await this.validarLoteamento(idLoteamento);
        await this.validarDuplicada(idLoteamento, identificacao);

        const quadra = new QuadraBuilder()
            .withIdentificacao(identificacao)
            .withIdLoteamento(idLoteamento)
            .withArea(dto.area)
            .withTestadaPara(dto.testadaPara?.trim() || null)
            .build();

        return this.toResponse(await this.quadraRepository.create(quadra));
    }

    async update(id: string, dto: UpdateQuadraDto): Promise<ResponseQuadraDto> {
        const parsedId = this.parseBigInt(id, "id");
        const atual = await this.quadraRepository.findById(parsedId);
        if (!atual) throw new NotFoundException("Quadra não encontrada");

        const idLoteamento = dto.idLoteamento === undefined ? atual.idLoteamento : BigInt(dto.idLoteamento);
        const identificacao =
            dto.identificacao === undefined ? atual.identificacao : this.identificacao(dto.identificacao);

        if (idLoteamento !== atual.idLoteamento) await this.validarLoteamento(idLoteamento);
        await this.validarDuplicada(idLoteamento, identificacao, parsedId);

        const quadra = new QuadraBuilder(parsedId)
            .withIdentificacao(identificacao)
            .withIdLoteamento(idLoteamento)
            .withArea(dto.area === undefined ? atual.area : dto.area)
            .withTestadaPara(dto.testadaPara === undefined ? atual.testadaPara : dto.testadaPara?.trim() || null)
            .withCreatedAt(atual.createdAt)
            .withUpdatedAt(new Date())
            .build();

        const salva = await this.quadraRepository.update(quadra);
        if (!salva) throw new NotFoundException("Quadra não encontrada");
        return this.toResponse(salva);
    }

    async delete(id: string): Promise<void> {
        const parsedId = this.parseBigInt(id, "id");
        if (!(await this.quadraRepository.findById(parsedId))) {
            throw new NotFoundException("Quadra não encontrada");
        }
        await this.quadraRepository.delete(parsedId);
    }

    async findAll(idLoteamento?: string): Promise<ResponseQuadraDto[]> {
        const filtro = idLoteamento ? { idLoteamento: this.parseBigInt(idLoteamento, "idLoteamento") } : {};
        const quadras = await this.quadraRepository.findAll(filtro);
        return quadras.map((quadra) => this.toResponse(quadra));
    }

    async findById(id: string): Promise<ResponseQuadraDto> {
        const quadra = await this.quadraRepository.findById(this.parseBigInt(id, "id"));
        if (!quadra) throw new NotFoundException("Quadra não encontrada");
        return this.toResponse(quadra);
    }

    private async validarLoteamento(idLoteamento: bigint) {
        if (!(await this.quadraRepository.loteamentoExiste(idLoteamento))) {
            throw new BadRequestException("Loteamento não encontrado.");
        }
    }

    /** A identificação só precisa ser única dentro do mesmo loteamento. */
    private async validarDuplicada(idLoteamento: bigint, identificacao: string, ignorarId?: bigint) {
        const existente = await this.quadraRepository.findByIdentificacao(idLoteamento, identificacao);
        if (existente && existente.id !== ignorarId) {
            throw new ConflictException(`Já existe a quadra ${identificacao} neste loteamento.`);
        }
    }

    private identificacao(valor: string): string {
        const normalizado = valor.trim();
        if (!normalizado) throw new BadRequestException("Identificação não pode estar vazia.");
        return normalizado;
    }

    private toResponse(quadra: Quadra): ResponseQuadraDto {
        return {
            id: quadra.id!.toString(),
            identificacao: quadra.identificacao,
            idLoteamento: quadra.idLoteamento.toString(),
            area: quadra.area,
            testadaPara: quadra.testadaPara,
            criadaEm: quadra.createdAt.toISOString(),
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
