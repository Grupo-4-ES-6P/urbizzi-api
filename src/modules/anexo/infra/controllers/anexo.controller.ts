import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { CreateAnexoDto } from "../../application/dto/create-anexo.dto";
import { UpdateAnexoDto } from "../../application/dto/update-anexo.dto";
import { AnexoService } from "../../application/services/anexo.service";
import type { AnexoEntity } from "../../domain/models/anexo.entity";

interface AnexoResponse {
  idAnexo: number;
  tipoArquivo: string;
  caminhoArquivo: string;
  dataUpload: string;
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("anexos")
export class AnexoController {
  constructor(private readonly service: AnexoService) {}

  @Permissoes(Permission.ANEXO_CRIAR)
  @Post()
  async save(@Body() body: CreateAnexoDto): Promise<AnexoResponse> {
    return this.toResponse(await this.service.save(body));
  }

  @Permissoes(Permission.ANEXO_VISUALIZAR)
  @Get()
  async findMany(): Promise<AnexoResponse[]> {
    const anexos = await this.service.findMany();
    return anexos.map((anexo) => this.toResponse(anexo));
  }

  @Permissoes(Permission.ANEXO_VISUALIZAR)
  @Get(":id")
  async findById(@Param("id") id: string): Promise<AnexoResponse> {
    return this.toResponse(await this.service.findById(id));
  }

  @Permissoes(Permission.ANEXO_ATUALIZAR)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateAnexoDto,
  ): Promise<AnexoResponse> {
    return this.toResponse(await this.service.updateById(id, body));
  }

  @Permissoes(Permission.ANEXO_EXCLUIR)
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.service.removeById(id);
  }

  private toResponse(anexo: AnexoEntity): AnexoResponse {
    return {
      idAnexo: anexo.idAnexo,
      tipoArquivo: anexo.tipoArquivo,
      caminhoArquivo: anexo.caminhoArquivo,
      dataUpload: anexo.dataUpload.toISOString(),
    };
  }
}
