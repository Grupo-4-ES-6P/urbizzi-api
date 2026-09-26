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
import { CreateLogradouroDto } from "../../application/dto/create-logradouro.dto";
import { UpdateLogradouroDto } from "../../application/dto/update-logradouro.dto";
import { LogradouroService } from "../../application/services/logradouro.service";
import type { LogradouroEntity } from "../../domain/models/logradouro.entity";

interface LogradouroHttpResponse {
  idLogradouro: string | null;
  nome: string;
  idCidade: string;
}

@Controller("logradouros")
export class LogradouroController {
  constructor(private readonly logradouroService: LogradouroService) {}

  @Post()
  async save(
    @Body() body: CreateLogradouroDto,
  ): Promise<LogradouroHttpResponse> {
    return this.toHttpResponse(await this.logradouroService.save(body));
  }

  @Get()
  async findMany(
    @Query("idCidade") idCidade?: string,
  ): Promise<LogradouroHttpResponse[]> {
    const logradouros = await this.logradouroService.findMany(idCidade);
    return logradouros.map((logradouro) => this.toHttpResponse(logradouro));
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<LogradouroHttpResponse> {
    const logradouro = await this.logradouroService.findById(id);

    if (!logradouro) {
      throw new NotFoundException("Logradouro não encontrado.");
    }

    return this.toHttpResponse(logradouro);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateLogradouroDto,
  ): Promise<LogradouroHttpResponse> {
    return this.toHttpResponse(
      await this.logradouroService.updateById(id, body),
    );
  }

  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.logradouroService.removeById(id);
  }

  private toHttpResponse(
    logradouro: LogradouroEntity,
  ): LogradouroHttpResponse {
    return {
      idLogradouro: logradouro.idLogradouro
        ? logradouro.idLogradouro.toString()
        : null,
      nome: logradouro.nome,
      idCidade: logradouro.idCidade.toString(),
    };
  }
}
