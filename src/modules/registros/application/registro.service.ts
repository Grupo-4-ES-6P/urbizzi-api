import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, asc, eq, type SQL } from "drizzle-orm";
import type { TabelaRegistro } from "../infra/schemas/registros.schema";
import type { RegistroDto } from "./dto/registro.dto";

export interface ConfigRegistro {
  nome: string;
  tabela: TabelaRegistro;
  /** Status que só quem tem a permissão pode aplicar (ex.: cancelada → CANCELAR_VENDA). */
  statusExigem?: Record<string, string>;
}

export interface RegistroResponse {
  id: string;
  codigo: string | null;
  idLote: string | null;
  idCliente: string | null;
  status: string | null;
  data: string | null;
  valor: number | null;
  detalhes: Record<string, unknown>;
  criadoEm: string;
  atualizadoEm: string;
}

type Linha = TabelaRegistro["$inferSelect"];

const opcionalBigInt = (valor?: number | null) => (valor == null ? null : BigInt(valor));

export class RegistroService {
  constructor(
    private readonly drizzle: DrizzleService,
    readonly config: ConfigRegistro,
  ) {}

  private get tabela() {
    return this.config.tabela;
  }

  async listar(filtro: { idLote?: string; idCliente?: string } = {}): Promise<RegistroResponse[]> {
    const condicoes: SQL[] = [];
    if (filtro.idLote) condicoes.push(eq(this.tabela.idLote, this.parseId(filtro.idLote)));
    if (filtro.idCliente) condicoes.push(eq(this.tabela.idCliente, this.parseId(filtro.idCliente)));
    const linhas = await this.drizzle.db
      .select()
      .from(this.tabela)
      .where(condicoes.length ? and(...condicoes) : undefined)
      .orderBy(asc(this.tabela.id));
    return linhas.map((linha) => this.toResponse(linha));
  }

  async buscar(id: string): Promise<RegistroResponse> {
    return this.toResponse(await this.linha(this.parseId(id)));
  }

  async criar(dto: RegistroDto, usuario?: RequestAuthUser): Promise<RegistroResponse> {
    this.exigirPermissaoDoStatus(dto.status, usuario);
    const [linha] = await this.drizzle.db
      .insert(this.tabela)
      .values({
        codigo: dto.codigo?.trim() || null,
        idLote: opcionalBigInt(dto.idLote),
        idCliente: opcionalBigInt(dto.idCliente),
        status: dto.status ?? null,
        data: dto.data ? new Date(dto.data) : null,
        valor: dto.valor ?? null,
        detalhes: dto.detalhes ?? {},
      })
      .returning();
    return this.toResponse(linha);
  }

  /** Campo ausente mantém o valor; null apaga. */
  async atualizar(id: string, dto: RegistroDto, usuario?: RequestAuthUser): Promise<RegistroResponse> {
    const parsedId = this.parseId(id);
    const atual = await this.linha(parsedId);
    if (dto.status !== undefined && dto.status !== atual.status) this.exigirPermissaoDoStatus(dto.status, usuario);

    const valores: Partial<Linha> = { updatedAt: new Date() };
    if (dto.codigo !== undefined) valores.codigo = dto.codigo?.trim() || null;
    if (dto.idLote !== undefined) valores.idLote = opcionalBigInt(dto.idLote);
    if (dto.idCliente !== undefined) valores.idCliente = opcionalBigInt(dto.idCliente);
    if (dto.status !== undefined) valores.status = dto.status;
    if (dto.data !== undefined) valores.data = dto.data ? new Date(dto.data) : null;
    if (dto.valor !== undefined) valores.valor = dto.valor;
    if (dto.detalhes !== undefined) valores.detalhes = dto.detalhes;

    const [linha] = await this.drizzle.db
      .update(this.tabela)
      .set(valores)
      .where(eq(this.tabela.id, parsedId))
      .returning();
    return this.toResponse(linha);
  }

  async excluir(id: string): Promise<void> {
    const parsedId = this.parseId(id);
    await this.linha(parsedId);
    await this.drizzle.db.delete(this.tabela).where(eq(this.tabela.id, parsedId));
  }

  private async linha(id: bigint): Promise<Linha> {
    const [linha] = await this.drizzle.db.select().from(this.tabela).where(eq(this.tabela.id, id)).limit(1);
    if (!linha) throw new NotFoundException(`${this.config.nome} não encontrado(a).`);
    return linha;
  }

  private exigirPermissaoDoStatus(status: string | null | undefined, usuario?: RequestAuthUser) {
    const exigida = status ? this.config.statusExigem?.[status] : undefined;
    if (!exigida || !usuario) return;
    const permissoes = usuario.permissoes ?? [];
    if (!permissoes.includes("ADMIN") && !permissoes.includes(exigida)) {
      throw new ForbiddenException("Você não possui permissão para executar esta ação.");
    }
  }

  private parseId(valor: string): bigint {
    if (!/^\d+$/.test(valor.trim())) throw new BadRequestException("Identificador inválido.");
    return BigInt(valor.trim());
  }

  toResponse(linha: Linha): RegistroResponse {
    return {
      id: linha.id.toString(),
      codigo: linha.codigo,
      idLote: linha.idLote?.toString() ?? null,
      idCliente: linha.idCliente?.toString() ?? null,
      status: linha.status,
      data: linha.data?.toISOString() ?? null,
      valor: linha.valor,
      detalhes: linha.detalhes,
      criadoEm: linha.createdAt.toISOString(),
      atualizadoEm: linha.updatedAt.toISOString(),
    };
  }
}
