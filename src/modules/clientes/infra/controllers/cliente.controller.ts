import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { CreateClienteDto } from "../../application/dto/create-cliente.dto";
import { FindClientesQueryDto } from "../../application/dto/find-clientes-query.dto";
import { UpdateClienteDto } from "../../application/dto/update-cliente.dto";
import {
  type ClientePaginacao,
  ClienteService,
} from "../../application/services/cliente.service";
import type {
  ClienteEntity,
  ContatoComercial,
} from "../../domain/models/cliente.entity";

interface EnderecoHttpResponse {
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  pais: string | null;
}

interface ClienteHttpResponse {
  id: string;
  tipoDocumento: string;
  documentoIdentificacao: string;
  nome: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  nomeExibicao: string;
  telefone: string | null;
  celular: string | null;
  email: string | null;
  origem: string | null;
  rg: string | null;
  dataNascimento: string | null;
  estadoCivil: string | null;
  profissao: string | null;
  responsavel: string | null;
  imovelInteresseId: string | null;
  endereco: EnderecoHttpResponse;
  contatos: ContatoComercial[];
  status: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("clientes")
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
  ) {}

  @Permissoes("CLIENTE_CRIAR")
  @Post()
  async create(@Body() body: CreateClienteDto): Promise<{
    cliente: ClienteHttpResponse;
  }> {
    const result = await this.clienteService.create(body);
    return {
      cliente: this.toResponse(result.cliente),
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

  @Permissoes(Permission.CLIENTE_EXCLUIR)
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.clienteService.delete(id);
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
      celular: cliente.celular,
      email: cliente.email,
      origem: cliente.origem,
      rg: cliente.rg,
      dataNascimento: cliente.dataNascimento,
      estadoCivil: cliente.estadoCivil,
      profissao: cliente.profissao,
      responsavel: cliente.responsavel,
      imovelInteresseId: cliente.imovelInteresseId,
      endereco: {
        cep: cliente.enderecoCep,
        logradouro: cliente.enderecoLogradouro,
        numero: cliente.enderecoNumero,
        complemento: cliente.enderecoComplemento,
        bairro: cliente.enderecoBairro,
        cidade: cliente.enderecoCidade,
        uf: cliente.enderecoUf,
        pais: cliente.enderecoPais,
      },
      contatos: cliente.contatos,
      status: cliente.status,
      dataCadastro: cliente.dataCadastro.toISOString(),
      dataAtualizacao: cliente.dataAtualizacao.toISOString(),
    };
  }
}
