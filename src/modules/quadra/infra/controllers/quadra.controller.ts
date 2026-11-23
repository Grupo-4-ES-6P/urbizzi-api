import { CreateQuadraDto } from "@modules/quadra/application/dtos/quadra-create.dto";
import type { ResponseQuadraDto } from "@modules/quadra/application/dtos/quadra-response.dto";
import { UpdateQuadraDto } from "@modules/quadra/application/dtos/quadra-update.dto";
import { QuadraService } from "@modules/quadra/application/services/quadra.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("quadras")
export class QuadraController {
    constructor(private readonly service: QuadraService) {}

    @Permissoes(Permission.QUADRA_WRITE)
    @Post()
    async save(@Body() body: CreateQuadraDto): Promise<ResponseQuadraDto> {
        return this.service.create(body);
    }

    @Permissoes(Permission.QUADRA_READ)
    @ApiQuery({ name: "idLoteamento", required: false })
    @Get()
    async getAll(@Query("idLoteamento") idLoteamento?: string): Promise<ResponseQuadraDto[]> {
        return this.service.findAll(idLoteamento);
    }

    @Permissoes(Permission.QUADRA_READ)
    @Get(":id")
    async getById(@Param("id") id: string): Promise<ResponseQuadraDto> {
        return this.service.findById(id);
    }

    @Permissoes(Permission.QUADRA_UPDATE)
    @Put(":id")
    async update(@Param("id") id: string, @Body() body: UpdateQuadraDto): Promise<ResponseQuadraDto> {
        return this.service.update(id, body);
    }

    @Permissoes(Permission.QUADRA_DELETE)
    @HttpCode(204)
    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.service.delete(id);
    }
}
