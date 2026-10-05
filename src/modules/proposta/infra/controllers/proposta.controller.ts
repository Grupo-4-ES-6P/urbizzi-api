import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  JwtAuthGuard,
  type RequestAuthUser,
} from "@shared/guards/jwt-auth.guard";
import type { Request } from "express";
import { CreatePropostaDto } from "../../application/dto/create-proposta.dto";
import { UpdatePropostaDto } from "../../application/dto/update-proposta.dto";
import { PropostaService } from "../../application/services/proposta.service";
import type { PropostaEntity } from "../../domain/models/proposta.entity";

interface PropostaResponse {
  idProposta: number;
  valor: string;
  condicoes: string;
  observacoes: string | null;
  versao: number;
  status: string;
  justificativa: string | null;
  prazoResposta: string | null;
  dataCriacao: string;
  dataVenda: string | null;
  dataCancelamento: string | null;
  idLote: number;
  idUsuario: number;
  idCliente: number;
}

@UseGuards(JwtAuthGuard)
@Controller("propostas")
export class PropostaController {
  constructor(private readonly service: PropostaService) {}

  @Post()
  async save(
    @Body() body: CreatePropostaDto,
    @Req() request: Request & { user: RequestAuthUser },
  ): Promise<PropostaResponse> {
    return this.toResponse(await this.service.save(body, request.user.sub));
  }

  @Get()
  async findMany(): Promise<PropostaResponse[]> {
    const propostas = await this.service.findMany();
    return propostas.map((proposta) => this.toResponse(proposta));
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<PropostaResponse> {
    return this.toResponse(await this.service.findById(id));
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdatePropostaDto,
  ): Promise<PropostaResponse> {
    return this.toResponse(await this.service.updateById(id, body));
  }

  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.service.removeById(id);
  }

  private toResponse(proposta: PropostaEntity): PropostaResponse {
    return {
      idProposta: proposta.idProposta,
      valor: proposta.valor,
      condicoes: proposta.condicoes,
      observacoes: proposta.observacoes,
      versao: proposta.versao,
      status: proposta.status,
      justificativa: proposta.justificativa,
      prazoResposta: proposta.prazoResposta?.toISOString() ?? null,
      dataCriacao: proposta.dataCriacao.toISOString(),
      dataVenda: proposta.dataVenda?.toISOString() ?? null,
      dataCancelamento: proposta.dataCancelamento?.toISOString() ?? null,
      idLote: proposta.idLote,
      idUsuario: proposta.idUsuario,
      idCliente: proposta.idCliente,
    };
  }
}
