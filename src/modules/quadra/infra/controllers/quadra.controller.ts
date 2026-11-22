import { CreateQuadraDto } from "@modules/quadra/application/dtos/quadra-create.dto";
import { UpdateQuadraDto } from "@modules/quadra/application/dtos/quadra-update.dto";
import type { ResponseQuadraDto } from "@modules/quadra/application/dtos/quadra-response.dto";
import { QuadraService } from "@modules/quadra/application/services/quadra.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { Public } from "@shared/decorators/public.decorator";

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("quadras")
export class QuadraController {
    constructor(private readonly service: QuadraService) {}

    @Permissoes(Permission.QUADRA_WRITE)
    @Post()
    async save(@Body() body: CreateQuadraDto): Promise<ResponseQuadraDto> {
        return await this.service.create(body);
    }

    @Permissoes(Permission.QUADRA_READ)
    @Get()
    async getAll(): Promise<ResponseQuadraDto[]> {
        return await this.service.findAll();
    }

    @Permissoes(Permission.QUADRA_READ)
    @Get(":id")
    async getById(@Param("id") id: string): Promise<ResponseQuadraDto> {
        return await this.service.findById(id);
    }

    @Permissoes(Permission.QUADRA_READ)
    @Get(":identificacao")
    async getByIdentificacao(@Param("identificacao") identificacao: string): Promise<ResponseQuadraDto> {
        return await this.service.findByIdentificacao(identificacao);
    }

    @Permissoes(Permission.QUADRA_READ)
    @Get(":idLoteamento")
    async getByLoteamento(@Param("idLoteamento") idLoteamento: string): Promise<ResponseQuadraDto[]> {
        return await this.service.findByLoteamento(idLoteamento); 
    }

    @Permissoes(Permission.QUADRA_UPDATE)
    @Put(":id")
    async update(
        @Param("id") id: string,
        @Body() body: UpdateQuadraDto
    ): Promise<ResponseQuadraDto> {
        return await this.service.update(id, body);
    }

    @Permissoes(Permission.QUADRA_DELETE)
    @Delete(":id")
    async delete(@Param("id") id: string): Promise<Boolean> {
        return await this.service.delete(id);
    }
}