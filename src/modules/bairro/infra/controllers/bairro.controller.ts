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
  Query,
} from "@nestjs/common";
import { CreateBairroDto } from "../../application/dto/create-bairro.dto";
import { UpdateBairroDto } from "../../application/dto/update-bairro.dto";
import { BairroService } from "../../application/services/bairro.service";
import type { BairroEntity } from "../../domain/models/bairro.entity";

interface BairroHttpResponse {
  idBairro: string | null;
  nome: string;
  idCidade: string;
}

@Controller("bairros")
export class BairroController {
  constructor(private readonly bairroService: BairroService) {}

  @Post()
  async save(@Body() body: CreateBairroDto): Promise<BairroHttpResponse> {
    return this.toHttpResponse(await this.bairroService.save(body));
  }

  @Get()
  async findMany(
    @Query("idCidade") idCidade?: string,
  ): Promise<BairroHttpResponse[]> {
    const bairros = await this.bairroService.findMany(idCidade);
    return bairros.map((bairro) => this.toHttpResponse(bairro));
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<BairroHttpResponse> {
    const bairro = await this.bairroService.findById(id);

    if (!bairro) {
      throw new NotFoundException("Bairro não encontrado.");
    }

    return this.toHttpResponse(bairro);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateBairroDto,
  ): Promise<BairroHttpResponse> {
    return this.toHttpResponse(await this.bairroService.updateById(id, body));
  }

  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.bairroService.removeById(id);
  }

  private toHttpResponse(bairro: BairroEntity): BairroHttpResponse {
    return {
      idBairro: bairro.idBairro ? bairro.idBairro.toString() : null,
      nome: bairro.nome,
      idCidade: bairro.idCidade.toString(),
    };
  }
}
