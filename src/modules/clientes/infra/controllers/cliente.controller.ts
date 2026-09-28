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
import { Public } from "@shared/decorators/public.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import {
  ActivateClienteAccessDto,
  CreateClienteAccessDto,
} from "../../application/dto/cliente-access.dto";
import type { CreateClienteDto } from "../../application/dto/create-cliente.dto";
import { FindClientesQueryDto } from "../../application/dto/find-clientes-query.dto";
import type { UpdateClienteDto } from "../../application/dto/update-cliente.dto";
import {
  type ClientePaginacao,
  ClienteService,
} from "../../application/services/cliente.service";
import { ClienteAccessService } from "../../application/services/cliente-access.service";
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
  acesso: {
    usuarioId: string;
    email: string;
    status: string;
  } | null;
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("clientes")
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly clienteAccessService: ClienteAccessService,
  ) {}

  @Permissoes("CLIENTE_CRIAR")
  @Post()
  async create(@Body() body: CreateClienteDto): Promise<{
    cliente: ClienteHttpResponse;
    conviteEnviado: boolean | null;
  }> {
    const result = await this.clienteService.create(body);
    return {
      cliente: this.toResponse(result.cliente),
      conviteEnviado: result.conviteEnviado,
    };
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

  @Permissoes("CLIENTE_GERENCIAR_ACESSO")
  @Post(":id/acesso")
  async createAccess(
    @Param("id") id: string,
    @Body() body: CreateClienteAccessDto,
  ): Promise<{ conviteEnviado: boolean }> {
    const cliente = await this.clienteService.findById(id);
    return {
      conviteEnviado: await this.clienteAccessService.createForClient(
        cliente.id!,
        body.emailAcesso,
      ),
    };
  }

  @Permissoes("CLIENTE_GERENCIAR_ACESSO")
  @Patch(":id/acesso/bloquear")
  async blockAccess(@Param("id") id: string): Promise<void> {
    const cliente = await this.clienteService.findById(id);
    await this.clienteAccessService.block(cliente.id!);
  }

  @Permissoes("CLIENTE_GERENCIAR_ACESSO")
  @Patch(":id/acesso/reativar")
  async reactivateAccess(@Param("id") id: string): Promise<void> {
    const cliente = await this.clienteService.findById(id);
    await this.clienteAccessService.reactivate(cliente.id!);
  }

  @Permissoes("CLIENTE_GERENCIAR_ACESSO")
  @Post(":id/acesso/reenviar-convite")
  async resendInvitation(
    @Param("id") id: string,
  ): Promise<{ conviteEnviado: boolean }> {
    const cliente = await this.clienteService.findById(id);
    return {
      conviteEnviado: await this.clienteAccessService.resend(cliente.id!),
    };
  }

  @Public()
  @Post("ativar-acesso")
  async activateAccess(@Body() body: ActivateClienteAccessDto): Promise<void> {
    await this.clienteAccessService.activate(body.token, body.senha);
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
      acesso:
        cliente.usuarioId && cliente.emailAcesso && cliente.statusAcesso
          ? {
              usuarioId: cliente.usuarioId.toString(),
              email: cliente.emailAcesso,
              status: cliente.statusAcesso,
            }
          : null,
    };
  }
}
