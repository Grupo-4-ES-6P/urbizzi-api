import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateCidadeDto } from "../../application/dto/create-cidade.dto";
import { UpdateCidadeDto } from "../../application/dto/update-cidade.dto";
import { CidadeService } from "../../application/services/cidade.service";
import type { CidadeEntity } from "../../domain/models/cidade.entity";

interface CidadeHttpResponse {
  idCidade: string | null;
  nome: string;
}

@Controller("cidades")
export class CidadeController {
  constructor(private readonly cidadeService: CidadeService) {}

  @Post()
  async save(@Body() body: CreateCidadeDto): Promise<CidadeHttpResponse> {
    return this.toHttpResponse(await this.cidadeService.save(body));
  }

  @Get()
  async findMany(): Promise<CidadeHttpResponse[]> {
    const cidades = await this.cidadeService.findMany();
    return cidades.map((cidade) => this.toHttpResponse(cidade));
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<CidadeHttpResponse> {
    const cidade = await this.cidadeService.findById(id);

    if (!cidade) {
      throw new NotFoundException("Cidade não encontrada.");
    }

    return this.toHttpResponse(cidade);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateCidadeDto,
  ): Promise<CidadeHttpResponse> {
    return this.toHttpResponse(await this.cidadeService.updateById(id, body));
  }

  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.cidadeService.removeById(id);
  }

  private toHttpResponse(cidade: CidadeEntity): CidadeHttpResponse {
    return {
      idCidade: cidade.idCidade ? cidade.idCidade.toString() : null,
      nome: cidade.nome,
    };
  }
}
