import { CreateLoteDto } from "@modules/lote/application/dto/lote-create.dto";
import { UpdateLoteDto } from "@modules/lote/application/dto/lote-update.dto";
import { ResponseLoteDto } from "@modules/lote/application/dto/lote-response.dto";
import { LoteService } from "@modules/lote/application/service/lote.service";
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

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("lote")
export class LoteController {
    constructor(private readonly service: LoteService) {}

    @Permissoes(Permission.LOTE_WRITE)
    @Post()
    async save(@Body() body:CreateLoteDto): Promise<ResponseLoteDto> {
        return await this.service.create(body);
    }

    @Permissoes(Permission.LOTE_UPDATE)
    @Put(":id")
    async update(
        @Param() id: string,
        @Body() body: UpdateLoteDto
    ): Promise<ResponseLoteDto> {
        return await this.service.update(id, body);
    }

    @Permissoes(Permission.LOTE_DELETE)
    @Delete(":id")
    async delete(@Param() id: string): Promise<boolean> {
        return await this.service.delete(id);
    }

    @Permissoes(Permission.LOTE_READ)
    @Get()
    async getAll(): Promise<ResponseLoteDto[]> {
        return await this.service.findAll();
    }

    @Permissoes(Permission.LOTE_READ)
    @Get(":id")
    async getById(@Param() id: string): Promise<ResponseLoteDto> {
        return await this.service.findById(id);
    }

    @Permissoes(Permission.LOTE_READ)
    @Get(":matricula")
    async getByMatricula(@Param() matricula: string): Promise<ResponseLoteDto> {
        return await this.service.findByMatricula(matricula);
    }

    @Permissoes(Permission.LOTE_READ)
    @Get(":idQuadra")
    async getByQuadra(@Param() idQuadra: string): Promise<ResponseLoteDto[]> {
        return await this.service.findByQuadra(idQuadra);
    }

    @Permissoes(Permission.LOTE_READ)
    @Get(":idLogradouro")
    async getByLogradouro(@Param() idLogradouro: string): Promise<ResponseLoteDto[]> {
        return await this.service.findByLogradouro(idLogradouro);
    }
}