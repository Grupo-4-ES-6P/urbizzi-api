import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import type { CreateClienteDto } from "../../application/dto/create-cliente.dto";
import { FindClientesQueryDto } from "../../application/dto/find-clientes-query.dto";
import type { UpdateClienteDto } from "../../application/dto/update-cliente.dto";
import {
  type ClientePaginacao,
  ClienteService,
} from "../../application/services/cliente.service";
import type { ClienteEntity } from "../../domain/models/cliente.entity";

interface ClienteHttpResponse {
  id: string;
  tipoDocumento: string;
  documentoIdentificacao: string;
  nome: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  nomeExibicao: string;
  telefone: string;
  email: string | null;
  origem: string | null;
  status: string;
  usuarioId: string | null;
  dataCadastro: string;
  dataAtualizacao: string;
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("clientes")
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Permissoes("CLIENTE_CRIAR")
  @Post()
  async create(@Body() body: CreateClienteDto): Promise<ClienteHttpResponse> {
    return this.toResponse(await this.clienteService.create(body));
  }

  @Permissoes("CLIENTE_VISUALIZAR")
  @Get()
  async findMany(@Query() query: FindClientesQueryDto): Promise<{
    data: ClienteHttpResponse[];
    page: ClientePaginacao;
  }> {
    const result = await this.clienteService.findMany(query);
    return {
      data: result.data.map((cliente) => this.toResponse(cliente)),
      page: result.paginacao,
    };
  }

  @Permissoes("CLIENTE_VISUALIZAR")
  @Get(":id")
  async findById(@Param("id") id: string): Promise<ClienteHttpResponse> {
    return this.toResponse(await this.clienteService.findById(id));
  }

  @Permissoes("CLIENTE_ATUALIZAR")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateClienteDto,
  ): Promise<ClienteHttpResponse> {
    return this.toResponse(await this.clienteService.update(id, body));
  }

  @Permissoes("CLIENTE_DESATIVAR")
  @Patch(":id/desativar")
  async deactivate(@Param("id") id: string): Promise<ClienteHttpResponse> {
    return this.toResponse(await this.clienteService.deactivate(id));
  }

  @Permissoes("CLIENTE_REATIVAR")
  @Patch(":id/reativar")
  async reactivate(@Param("id") id: string): Promise<ClienteHttpResponse> {
    return this.toResponse(await this.clienteService.reactivate(id));
  }

  private toResponse(cliente: ClienteEntity): ClienteHttpResponse {
    return {
      id: cliente.id?.toString() ?? "",
      tipoDocumento: cliente.tipoDocumento,
      documentoIdentificacao: cliente.documentoIdentificacao,
      nome: cliente.nome,
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia,
      nomeExibicao: cliente.nomeExibicao,
      telefone: cliente.telefone,
      email: cliente.email,
      origem: cliente.origem,
      status: cliente.status,
      usuarioId: cliente.usuarioId?.toString() ?? null,
      dataCadastro: cliente.dataCadastro.toISOString(),
      dataAtualizacao: cliente.dataAtualizacao.toISOString(),
    };
  }
}
