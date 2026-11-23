import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { CreateAnexoDto } from "../../application/dto/create-anexo.dto";
import { UpdateAnexoDto } from "../../application/dto/update-anexo.dto";
import {
  AnexoService,
  TIPOS_ARQUIVO_PERMITIDOS,
  tipoDoArquivo,
} from "../../application/services/anexo.service";
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
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { arquivo: { type: "string", format: "binary" } } } })
  @UseInterceptors(
    FileInterceptor("arquivo", {
      storage: diskStorage({
        destination: (_req, _arquivo, pronto) => {
          const pasta = join(process.cwd(), "uploads");
          mkdirSync(pasta, { recursive: true });
          pronto(null, pasta);
        },
        // Nome aleatório: ninguém adivinha o endereço de um documento
        filename: (_req, arquivo, pronto) => pronto(null, `${randomUUID()}${extname(arquivo.originalname).toLowerCase()}`),
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, arquivo, aceitar) => {
        const tipo = tipoDoArquivo(arquivo.originalname, arquivo.mimetype);
        const permitido = (TIPOS_ARQUIVO_PERMITIDOS as readonly string[]).includes(tipo);
        aceitar(permitido ? null : new BadRequestException(`Tipo de arquivo não permitido: ${arquivo.mimetype || "desconhecido"}.`), permitido);
      },
    }),
  )
  @Post("upload")
  async upload(@UploadedFile() arquivo?: Express.Multer.File): Promise<AnexoResponse & { url: string }> {
    if (!arquivo) throw new BadRequestException("Envie o arquivo no campo 'arquivo'.");
    const caminho = `uploads/${arquivo.filename}`;
    const anexo = await this.service.save({
      tipoArquivo: tipoDoArquivo(arquivo.originalname, arquivo.mimetype),
      caminhoArquivo: caminho,
    });
    return { ...this.toResponse(anexo), url: `/${caminho}` };
  }

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
