import {
  Body,
  Controller,
  ForbiddenException,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { NotificacaoService } from "@modules/notificacoes/application/notificacao.service";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
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
  codigo: string | null;
  detalhes: Record<string, unknown>;
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

const STATUS_DE_DECISAO = ["aprovada", "recusada"];

/** Aprovar ou recusar exige a permissão da matriz. */
function exigirAprovacao(status: string | undefined, usuario?: RequestAuthUser) {
  if (!usuario || !status || !STATUS_DE_DECISAO.includes(status)) return;
  const permissoes = usuario.permissoes ?? [];
  if (!permissoes.includes("ADMIN") && !permissoes.includes("APROVAR_PROPOSTA")) {
    throw new ForbiddenException("Você não pode aprovar ou recusar propostas.");
  }
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("propostas")
export class PropostaController {
  constructor(
    private readonly service: PropostaService,
    private readonly notificacoes: NotificacaoService,
  ) {}

  @Permissoes("CRIAR_PROPOSTA")
  @Post()
  async save(
    @Body() body: CreatePropostaDto,
    @Req() request: Request & { user: RequestAuthUser },
  ): Promise<PropostaResponse> {
    exigirAprovacao(body.status, request.user);
    const proposta = await this.service.save(body, request.user.sub);
    await this.avisar(null, proposta, request.user.sub);
    return this.toResponse(proposta);
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

  @Permissoes("CRIAR_PROPOSTA")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdatePropostaDto,
    @Req() request?: Request & { user: RequestAuthUser },
  ): Promise<PropostaResponse> {
    exigirAprovacao(body.status, request?.user);
    const anterior = body.status || body.valor ? await this.service.findById(id) : null;
    const proposta = await this.service.updateById(id, body);
    if (anterior) await this.avisar(anterior, proposta, request?.user.sub);
    return this.toResponse(proposta);
  }

  @Permissoes("CRIAR_PROPOSTA")
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.service.removeById(id);
  }

  private async avisar(anterior: PropostaEntity | null, atual: PropostaEntity, autorDoAto?: string) {
    const nome = atual.codigo ?? `#${atual.idProposta}`;
    const link = `/propostas/${atual.idProposta}`;
    const novaVersao = !anterior || anterior.status !== atual.status || anterior.valor !== atual.valor;

    if (atual.status === "pendente" && novaVersao) {
      const valor = Number(atual.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      await this.notificacoes.notificar(
        {
          tipo: "proposta_pendente",
          titulo: "Proposta aguardando análise",
          mensagem: `A proposta ${nome}, de ${valor}, precisa de aprovação.`,
          link,
          chave: `proposta-pendente:${atual.idProposta}:${atual.versao}`,
        },
        { permissao: "APROVAR_PROPOSTA", exceto: autorDoAto },
      );
    }

    if (STATUS_DE_DECISAO.includes(atual.status) && anterior?.status !== atual.status) {
      await this.notificacoes.notificar(
        {
          tipo: `proposta_${atual.status}`,
          titulo: atual.status === "aprovada" ? "Proposta aprovada" : "Proposta recusada",
          mensagem: `Sua proposta ${nome} foi ${atual.status}.`,
          link,
          chave: `proposta-${atual.status}:${atual.idProposta}`,
        },
        { usuarios: [atual.idUsuario], exceto: autorDoAto },
      );
    }
  }

  private toResponse(proposta: PropostaEntity): PropostaResponse {
    return {
      idProposta: proposta.idProposta,
      codigo: proposta.codigo,
      detalhes: proposta.detalhes,
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
