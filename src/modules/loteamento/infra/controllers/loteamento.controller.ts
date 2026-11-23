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
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { CreateLoteamentoDto } from "../../application/dto/create-loteamento.dto";
import { UpdateLoteamentoDto } from "../../application/dto/update-loteamento.dto";
import { LoteamentoService } from "../../application/services/loteamento.service";
import type {
  LoteamentoDetalhes,
  LoteamentoEntity,
} from "../../domain/models/loteamento.entity";

interface LoteamentoResponse extends LoteamentoDetalhes {
  idLoteamento: number | null;
  nome: string;
  descricao: string;
  situacao: string;
  publicado: boolean;
  idBairro: number | null;
}

const ESCRITA = "CADASTRAR_IMOVEIS";

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("loteamentos")
export class LoteamentoController {
  constructor(private readonly service: LoteamentoService) {}

  @Permissoes(ESCRITA)
  @Post()
  async save(@Body() body: CreateLoteamentoDto): Promise<LoteamentoResponse> {
    return this.toResponse(await this.service.save(body));
  }

  @Get()
  async findMany(): Promise<LoteamentoResponse[]> {
    const items = await this.service.findMany();
    return items.map((item) => this.toResponse(item));
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<LoteamentoResponse> {
    return this.toResponse(await this.service.findById(id));
  }

  @Permissoes(ESCRITA)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateLoteamentoDto,
  ): Promise<LoteamentoResponse> {
    return this.toResponse(await this.service.updateById(id, body));
  }

  @Permissoes(ESCRITA)
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.service.removeById(id);
  }

  private toResponse(item: LoteamentoEntity): LoteamentoResponse {
    return {
      idLoteamento: item.idLoteamento ?? null,
      nome: item.nome,
      descricao: item.descricao,
      situacao: item.situacao,
      publicado: item.publicado,
      idBairro: item.idBairro,
      ...item.detalhes,
    };
  }
}
