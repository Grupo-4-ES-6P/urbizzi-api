import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ClienteEntity,
  StatusCliente,
  TipoDocumentoCliente,
} from "../../domain/models/cliente.entity";
import {
  type BuscarClientesFiltros,
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from "../../domain/repositories/cliente.repository";
import type { CreateClienteDto } from "../dto/create-cliente.dto";
import type { FindClientesQueryDto } from "../dto/find-clientes-query.dto";
import type { UpdateClienteDto } from "../dto/update-cliente.dto";

export interface ClientePaginacao {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ClientesPaginados {
  data: ClienteEntity[];
  paginacao: ClientePaginacao;
}

@Injectable()
export class ClienteService {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async create(dto: CreateClienteDto): Promise<ClienteEntity> {
    const documento = this.normalizeDigits(dto.documentoIdentificacao);
    this.validateDocumento(dto.tipoDocumento, documento);
    this.validateIdentity(dto.tipoDocumento, dto.nome, dto.razaoSocial);

    if (await this.clienteRepository.findByDocumento(documento)) {
      throw new ConflictException("Já existe cliente com este CPF ou CNPJ.");
    }

    return this.clienteRepository.save({
      tipoDocumento: dto.tipoDocumento,
      documentoIdentificacao: documento,
      nome: this.optionalTrim(dto.nome),
      razaoSocial: this.optionalTrim(dto.razaoSocial),
      nomeFantasia: this.optionalTrim(dto.nomeFantasia),
      telefone: this.normalizeTelefone(dto.telefone),
      email: this.normalizeEmail(dto.email),
      origem: this.optionalTrim(dto.origem),
      status: StatusCliente.ATIVO,
    });
  }

  async findById(id: string): Promise<ClienteEntity> {
    const cliente = await this.clienteRepository.findById(this.parseId(id));
    if (!cliente) throw new NotFoundException("Cliente não encontrado.");
    return cliente;
  }

  async findMany(query: FindClientesQueryDto): Promise<ClientesPaginados> {
    const filtros: BuscarClientesFiltros = {
      nome: this.optionalTrim(query.nome) ?? undefined,
      documentoIdentificacao: query.documentoIdentificacao
        ? this.normalizeDigits(query.documentoIdentificacao)
        : undefined,
      tipoDocumento: query.tipoDocumento,
      email: this.normalizeEmail(query.email) ?? undefined,
      telefone: query.telefone
        ? this.normalizeDigits(query.telefone)
        : undefined,
      origem: this.optionalTrim(query.origem) ?? undefined,
      status: query.status,
    };

    const result = await this.clienteRepository.findManyPaginated({
      filtros,
      page: query.page,
      perPage: query.perPage,
    });

    return {
      data: result.data,
      paginacao: {
        page: query.page,
        perPage: query.perPage,
        totalItems: result.totalItems,
        totalPages:
          result.totalItems === 0
            ? 0
            : Math.ceil(result.totalItems / query.perPage),
      },
    };
  }

  async update(id: string, dto: UpdateClienteDto): Promise<ClienteEntity> {
    const parsedId = this.parseId(id);
    const current = await this.clienteRepository.findById(parsedId);
    if (!current) throw new NotFoundException("Cliente não encontrado.");

    const tipoDocumento = dto.tipoDocumento ?? current.tipoDocumento;
    const documento = dto.documentoIdentificacao
      ? this.normalizeDigits(dto.documentoIdentificacao)
      : current.documentoIdentificacao;
    const nome =
      dto.nome !== undefined ? this.optionalTrim(dto.nome) : current.nome;
    const razaoSocial =
      dto.razaoSocial !== undefined
        ? this.optionalTrim(dto.razaoSocial)
        : current.razaoSocial;

    this.validateDocumento(tipoDocumento, documento);
    this.validateIdentity(tipoDocumento, nome, razaoSocial);

    if (documento !== current.documentoIdentificacao) {
      const duplicate = await this.clienteRepository.findByDocumento(documento);
      if (duplicate && duplicate.id !== parsedId) {
        throw new ConflictException("Já existe cliente com este CPF ou CNPJ.");
      }
    }

    const updated = await this.clienteRepository.update(parsedId, {
      tipoDocumento,
      documentoIdentificacao: documento,
      nome,
      razaoSocial,
      nomeFantasia:
        dto.nomeFantasia !== undefined
          ? this.optionalTrim(dto.nomeFantasia)
          : current.nomeFantasia,
      telefone: dto.telefone
        ? this.normalizeTelefone(dto.telefone)
        : current.telefone,
      email:
        dto.email !== undefined
          ? this.normalizeEmail(dto.email)
          : current.email,
      origem:
        dto.origem !== undefined
          ? this.optionalTrim(dto.origem)
          : current.origem,
    });

    if (!updated) throw new NotFoundException("Cliente não encontrado.");
    return updated;
  }

  async deactivate(id: string): Promise<ClienteEntity> {
    return this.changeStatus(id, StatusCliente.INATIVO);
  }

  async reactivate(id: string): Promise<ClienteEntity> {
    return this.changeStatus(id, StatusCliente.ATIVO);
  }

  private async changeStatus(id: string, status: StatusCliente) {
    const parsedId = this.parseId(id);
    if (!(await this.clienteRepository.findById(parsedId))) {
      throw new NotFoundException("Cliente não encontrado.");
    }
    const updated = await this.clienteRepository.update(parsedId, { status });
    if (!updated) throw new NotFoundException("Cliente não encontrado.");
    return updated;
  }

  private validateIdentity(
    tipo: TipoDocumentoCliente,
    nome?: string | null,
    razaoSocial?: string | null,
  ): void {
    if (tipo === TipoDocumentoCliente.CPF && !nome?.trim()) {
      throw new BadRequestException("Nome é obrigatório para cliente com CPF.");
    }
    if (tipo === TipoDocumentoCliente.CNPJ && !razaoSocial?.trim()) {
      throw new BadRequestException(
        "Razão social é obrigatória para cliente com CNPJ.",
      );
    }
  }

  private validateDocumento(tipo: TipoDocumentoCliente, value: string): void {
    const valid =
      tipo === TipoDocumentoCliente.CPF
        ? this.isValidCpf(value)
        : this.isValidCnpj(value);
    if (!valid) throw new BadRequestException(`${tipo} inválido.`);
  }

  private isValidCpf(value: string): boolean {
    if (!/^\d{11}$/.test(value) || /^(\d)\1+$/.test(value)) return false;
    const digit = (length: number) => {
      const sum = value
        .slice(0, length)
        .split("")
        .reduce(
          (acc, current, index) => acc + Number(current) * (length + 1 - index),
          0,
        );
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };
    return digit(9) === Number(value[9]) && digit(10) === Number(value[10]);
  }

  private isValidCnpj(value: string): boolean {
    if (!/^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false;
    const calculate = (base: string, weights: number[]) => {
      const sum = base
        .split("")
        .reduce(
          (acc, current, index) => acc + Number(current) * weights[index],
          0,
        );
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };
    const first = calculate(
      value.slice(0, 12),
      [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    const second = calculate(
      `${value.slice(0, 12)}${first}`,
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    return first === Number(value[12]) && second === Number(value[13]);
  }

  private normalizeTelefone(value: string): string {
    const digits = this.normalizeDigits(value);
    if (!/^\d{10,13}$/.test(digits)) {
      throw new BadRequestException("Telefone inválido.");
    }
    return digits;
  }

  private normalizeDigits(value: string): string {
    return value.replace(/\D/g, "");
  }

  private normalizeEmail(value?: string | null): string | null | undefined {
    return value === undefined
      ? undefined
      : value?.trim().toLowerCase() || null;
  }

  private optionalTrim(value?: string | null): string | null | undefined {
    return value === undefined ? undefined : value?.trim() || null;
  }

  private parseId(id: string): bigint {
    if (!/^\d+$/.test(id.trim())) throw new BadRequestException("id inválido.");
    return BigInt(id);
  }
}
