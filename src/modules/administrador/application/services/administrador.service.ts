import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AdministradorEntity } from "../../domain/models/administrador.entity";
import {
  ADMINISTRADOR_REPOSITORY,
  type AdministradorRepository,
  type BuscarAdministradoresFiltros,
} from "../../domain/repositories/administrador.repository";
import { CreateAdministradorDto } from "../dto/create-administrador.dto";
import { UpdateAdministradorDto } from "../dto/update-administrador.dto";

export interface AdministradorPaginacao {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface BuscarAdministradoresPaginadoResultado {
  data: AdministradorEntity[];
  paginacao: AdministradorPaginacao;
}

export interface AdministradoresLinksPaginados {
  self: string;
  first: string;
  last: string;
  next?: string;
  prev?: string;
}

@Injectable()
export class AdministradorService {
  constructor(
    @Inject(ADMINISTRADOR_REPOSITORY)
    private readonly administradorRepository: AdministradorRepository,
  ) {}

  async save(data: CreateAdministradorDto): Promise<AdministradorEntity> {
    const email = this.normalizeEmail(data.email);
    const cnpj = this.normalizeCnpj(data.cnpj);

    const administradorPorEmail =
      await this.administradorRepository.findByEmail(email);

    if (administradorPorEmail) {
      throw new ConflictException("Já existe administrador com este email.");
    }

    const administradoresComMesmoCnpj =
      await this.administradorRepository.findMany({ cnpj });

    if (
      administradoresComMesmoCnpj.some(
        (administrador) => administrador.cnpj === cnpj,
      )
    ) {
      throw new ConflictException("Já existe administrador com este CNPJ.");
    }

    return this.administradorRepository.save({
      nome: data.nome.trim(),
      email,
      cnpj,
      idEndereco: this.parseBigInt(data.idEndereco),
    });
  }

  async findById(id: bigint | string): Promise<AdministradorEntity | null> {
    return this.administradorRepository.findById(this.parseBigInt(id));
  }

  async findByEmail(email: string): Promise<AdministradorEntity | null> {
    return this.administradorRepository.findByEmail(this.normalizeEmail(email));
  }

  async findMany(
    filtros: BuscarAdministradoresFiltros = {},
  ): Promise<AdministradorEntity[]> {
    const filtrosNormalizados: BuscarAdministradoresFiltros = {};

    if (filtros.nome?.trim()) {
      filtrosNormalizados.nome = filtros.nome.trim();
    }

    if (filtros.email?.trim()) {
      filtrosNormalizados.email = this.normalizeEmail(filtros.email);
    }

    if (filtros.cnpj?.trim()) {
      filtrosNormalizados.cnpj = this.normalizeCnpj(filtros.cnpj);
    }

    return this.administradorRepository.findMany(filtrosNormalizados);
  }

  async findManyPaginated(
    filtros: BuscarAdministradoresFiltros = {},
    page = 1,
    perPage = 10,
  ): Promise<BuscarAdministradoresPaginadoResultado> {
    const administradores = await this.findMany(filtros);
    const totalItems = administradores.length;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / perPage) : 0;
    const offset = (page - 1) * perPage;

    return {
      data: administradores.slice(offset, offset + perPage),
      paginacao: {
        page,
        perPage,
        totalItems,
        totalPages,
      },
    };
  }

  async updateById(
    id: bigint | string,
    input: UpdateAdministradorDto,
  ): Promise<AdministradorEntity> {
    const parsedId = this.parseBigInt(id);

    const existente = await this.administradorRepository.findById(parsedId);

    if (!existente) {
      throw new NotFoundException("Administrador não encontrado.");
    }

    if (input.email) {
      const administradorComEmail = await this.findByEmail(input.email);

      if (administradorComEmail && administradorComEmail.id !== parsedId) {
        throw new ConflictException("Já existe administrador com este email.");
      }
    }

    const cnpjNormalizado = input.cnpj
      ? this.normalizeCnpj(input.cnpj)
      : undefined;

    if (cnpjNormalizado) {
      const administradoresComMesmoCnpj =
        await this.administradorRepository.findMany({ cnpj: cnpjNormalizado });

      if (
        administradoresComMesmoCnpj.some(
          (administrador) =>
            administrador.cnpj === cnpjNormalizado &&
            administrador.id !== parsedId,
        )
      ) {
        throw new ConflictException("Já existe administrador com este CNPJ.");
      }
    }

    const atualizado = await this.administradorRepository.update(parsedId, {
      nome: input.nome?.trim(),
      email: input.email ? this.normalizeEmail(input.email) : undefined,
      cnpj: cnpjNormalizado,
      idEndereco: input.idEndereco
        ? this.parseBigInt(input.idEndereco)
        : undefined,
    });

    if (!atualizado) {
      throw new NotFoundException("Administrador não encontrado.");
    }

    return atualizado;
  }

  async removeById(id: bigint | string): Promise<void> {
    const removed = await this.administradorRepository.remove(
      this.parseBigInt(id),
    );

    if (!removed) {
      throw new NotFoundException("Administrador não encontrado.");
    }
  }

  buildPaginacaoLinks(
    basePath: string,
    filtros: BuscarAdministradoresFiltros,
    paginacao: AdministradorPaginacao,
  ): AdministradoresLinksPaginados {
    const lastPage = paginacao.totalPages > 0 ? paginacao.totalPages : 1;

    const links: AdministradoresLinksPaginados = {
      self: this.buildPageLink(
        basePath,
        filtros,
        paginacao.page,
        paginacao.perPage,
      ),
      first: this.buildPageLink(basePath, filtros, 1, paginacao.perPage),
      last: this.buildPageLink(basePath, filtros, lastPage, paginacao.perPage),
    };

    if (paginacao.page > 1) {
      links.prev = this.buildPageLink(
        basePath,
        filtros,
        paginacao.page - 1,
        paginacao.perPage,
      );
    }

    if (paginacao.page < lastPage) {
      links.next = this.buildPageLink(
        basePath,
        filtros,
        paginacao.page + 1,
        paginacao.perPage,
      );
    }

    return links;
  }

  buildAdministradorLinks(
    basePath: string,
    id: string,
  ): {
    self: string;
    collection: string;
    update: string;
    remove: string;
  } {
    return {
      self: `${basePath}/${id}`,
      collection: basePath,
      update: `${basePath}/${id}`,
      remove: `${basePath}/${id}`,
    };
  }

  private parseBigInt(value: string | bigint): bigint {
    if (typeof value === "bigint") {
      return value;
    }

    const normalizedValue = value.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      throw new BadRequestException("Identificador inválido.");
    }

    return BigInt(normalizedValue);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
  }

  private buildPageLink(
    basePath: string,
    filtros: BuscarAdministradoresFiltros,
    page: number,
    perPage: number,
  ): string {
    const params = new URLSearchParams();

    params.set("page", page.toString());
    params.set("perPage", perPage.toString());

    if (filtros.nome) {
      params.set("nome", filtros.nome);
    }

    if (filtros.email) {
      params.set("email", filtros.email);
    }

    if (filtros.cnpj) {
      params.set("cnpj", filtros.cnpj);
    }

    return `${basePath}?${params.toString()}`;
  }
}
