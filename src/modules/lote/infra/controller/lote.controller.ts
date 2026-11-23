import { CreateLoteDto } from "@modules/lote/application/dto/lote-create.dto";
import { UpdateLoteDto } from "@modules/lote/application/dto/lote-update.dto";
import { ResponseLoteDto } from "@modules/lote/application/dto/lote-response.dto";
import { LoteService } from "@modules/lote/application/service/lote.service";
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
@Controller("lote")
export class LoteController {
    constructor(private readonly service: LoteService) {}

    @Permissoes(Permission.LOTE_WRITE)
    @Post()
    async save(@Body() body: CreateLoteDto): Promise<ResponseLoteDto> {
        return this.service.create(body);
    }

    @Permissoes(Permission.LOTE_UPDATE)
    @Put(":id")
    async update(@Param("id") id: string, @Body() body: UpdateLoteDto): Promise<ResponseLoteDto> {
        return this.service.update(id, body);
    }

    @Permissoes(Permission.LOTE_DELETE)
    @HttpCode(204)
    @Delete(":id")
    async delete(@Param("id") id: string): Promise<void> {
        await this.service.delete(id);
    }

    @Permissoes(Permission.LOTE_READ)
    @ApiQuery({ name: "idQuadra", required: false })
    @ApiQuery({ name: "idLogradouro", required: false })
    @ApiQuery({ name: "matricula", required: false })
    @Get()
    async getAll(
        @Query("idQuadra") idQuadra?: string,
        @Query("idLogradouro") idLogradouro?: string,
        @Query("matricula") matricula?: string,
    ): Promise<ResponseLoteDto[]> {
        return this.service.findAll({ idQuadra, idLogradouro, matricula });
    }

    @Permissoes(Permission.LOTE_READ)
    @Get(":id")
    async getById(@Param("id") id: string): Promise<ResponseLoteDto> {
        return this.service.findById(id);
    }
}
