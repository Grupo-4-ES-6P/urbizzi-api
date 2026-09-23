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
  Req,
  UseGuards,
} from "@nestjs/common";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import type { Request } from "express";
import { CreateAdministradorDto } from "../../application/dto/create-administrador.dto";
import { FindAdministradoresQueryDto } from "../../application/dto/find-administradores-query.dto";
import { UpdateAdministradorDto } from "../../application/dto/update-administrador.dto";
import { AdministradorService } from "../../application/services/administrador.service";
import type { AdministradorEntity } from "../../domain/models/administrador.entity";

interface AdministradorHttpResponse {
  id: string | null;
  nome: string;
  email: string;
  cnpj: string;
  idEndereco: string;
  idUsuario: string | null;
  _links: {
    self: { href: string };
    collection: { href: string };
    update: { href: string };
    remove: { href: string };
  };
}

interface AdministradoresCollectionHttpResponse {
  data: AdministradorHttpResponse[];
  page: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
  _links: {
    self: { href: string };
    first: { href: string };
    last: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
}

@UseGuards(JwtAuthGuard, PermissoesGuard)
@Controller("administradores")
export class AdministradorController {
  constructor(private readonly administradorService: AdministradorService) {}

  @Permissoes("ADMINISTRADOR_VISUALIZAR")
  @Get()
  async find(
    @Query() query: FindAdministradoresQueryDto,
    @Req() request: Request,
  ): Promise<
    AdministradorHttpResponse | AdministradoresCollectionHttpResponse
  > {
    const basePath = this.getBasePath(request);

    if (query.id) {
      const administrador = await this.administradorService.findById(query.id);

      if (!administrador) {
        throw new NotFoundException("Administrador não encontrado.");
      }

      return this.toHttpResponse(basePath, administrador);
    }

    if (query.email && !query.nome && !query.cnpj) {
      const administrador = await this.administradorService.findByEmail(
        query.email,
      );

      if (!administrador) {
        throw new NotFoundException("Administrador não encontrado.");
      }

      return this.toHttpResponse(basePath, administrador);
    }

    const filtros = {
      nome: query.nome,
      email: query.email,
      cnpj: query.cnpj,
    };
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 10;
    const result = await this.administradorService.findManyPaginated(
      filtros,
      page,
      perPage,
    );
    const links = this.administradorService.buildPaginacaoLinks(
      basePath,
      filtros,
      result.paginacao,
    );

    return {
      data: result.data.map((administrador) =>
        this.toHttpResponse(basePath, administrador),
      ),
      page: result.paginacao,
      _links: {
        self: { href: links.self },
        first: { href: links.first },
        last: { href: links.last },
        next: links.next ? { href: links.next } : undefined,
        prev: links.prev ? { href: links.prev } : undefined,
      },
    };
  }

  @Permissoes("ADMINISTRADOR_CRIAR")
  @Post()
  async save(
    @Body() body: CreateAdministradorDto,
    @Req() request: Request,
  ): Promise<AdministradorHttpResponse> {
    const administrador = await this.administradorService.save(body);
    return this.toHttpResponse(this.getBasePath(request), administrador);
  }

  @Permissoes("ADMINISTRADOR_ATUALIZAR")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateAdministradorDto,
    @Req() request: Request,
  ): Promise<AdministradorHttpResponse> {
    const administrador = await this.administradorService.updateById(id, body);
    return this.toHttpResponse(this.getBasePath(request), administrador);
  }

  @Permissoes("ADMINISTRADOR_REMOVER")
  @HttpCode(204)
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    await this.administradorService.removeById(id);
  }

  private getBasePath(request: Request): string {
    if (request.baseUrl && request.baseUrl.trim().length > 0) {
      return request.baseUrl;
    }

    return "/administradores";
  }

  private toHttpResponse(
    basePath: string,
    administrador: AdministradorEntity,
  ): AdministradorHttpResponse {
    const id = administrador.id ? administrador.id.toString() : "";
    const links = this.administradorService.buildAdministradorLinks(
      basePath,
      id,
    );

    return {
      id: administrador.id ? id : null,
      nome: administrador.nome,
      email: administrador.email,
      cnpj: administrador.cnpj,
      idEndereco: administrador.idEndereco.toString(),
      idUsuario: administrador.idUsuario
        ? administrador.idUsuario.toString()
        : null,
      _links: {
        self: { href: links.self },
        collection: { href: links.collection },
        update: { href: links.update },
        remove: { href: links.remove },
      },
    };
  }
}
