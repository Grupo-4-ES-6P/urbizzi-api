import { randomBytes } from "node:crypto";
import { ApiProperty } from "@nestjs/swagger";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from "class-validator";
import { desc, eq, sql } from "drizzle-orm";
import { linkPublicoSchema } from "../infra/schemas/link-publico.schema";

export const ESCOPOS = ["catalogo", "loteamento", "imovel"] as const;

export class CriarLinkDto {
  @ApiProperty({ enum: ESCOPOS })
  @IsIn(ESCOPOS)
  escopo!: (typeof ESCOPOS)[number];

  @ApiProperty({ required: false, description: "Id do loteamento ou do imóvel" })
  @ValidateIf((o: CriarLinkDto) => o.escopo !== "catalogo")
  @IsString()
  @MaxLength(64)
  alvo?: string;

  @ApiProperty({ required: false, nullable: true, description: "Vazio = sem expiração" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  validadeDias?: number | null;
}

export interface LinkResponse {
  id: string;
  token: string;
  escopo: string;
  alvo: string | null;
  expiraEm: string | null;
  visitas: number;
  criadoEm: string;
}

type Linha = typeof linkPublicoSchema.$inferSelect;

const DIA = 24 * 60 * 60 * 1000;

@Injectable()
export class LinkPublicoService {
  constructor(private readonly drizzle: DrizzleService) {}

  async criar(dto: CriarLinkDto, usuarioId: string): Promise<LinkResponse> {
    const [linha] = await this.drizzle.db
      .insert(linkPublicoSchema)
      .values({
        token: randomBytes(9).toString("base64url"),
        escopo: dto.escopo,
        alvo: dto.escopo === "catalogo" ? null : (dto.alvo ?? null),
        expiraEm: dto.validadeDias ? new Date(Date.now() + dto.validadeDias * DIA) : null,
        idUsuario: /^\d+$/.test(usuarioId) ? BigInt(usuarioId) : null,
      })
      .returning();
    return this.paraResposta(linha);
  }

  async listar(): Promise<LinkResponse[]> {
    const linhas = await this.drizzle.db
      .select()
      .from(linkPublicoSchema)
      .orderBy(desc(linkPublicoSchema.createdAt))
      .limit(200);
    return linhas.map((l) => this.paraResposta(l));
  }

  /** Acesso do visitante: conta a visita só se o link ainda vale. */
  async abrir(token: string): Promise<{ escopo: string; alvo: string | null; valido: boolean }> {
    const [linha] = await this.drizzle.db
      .select()
      .from(linkPublicoSchema)
      .where(eq(linkPublicoSchema.token, token))
      .limit(1);
    if (!linha) throw new NotFoundException("Link não encontrado.");

    const valido = !linha.expiraEm || linha.expiraEm.getTime() > Date.now();
    if (valido) {
      await this.drizzle.db
        .update(linkPublicoSchema)
        .set({ visitas: sql`${linkPublicoSchema.visitas} + 1` })
        .where(eq(linkPublicoSchema.id, linha.id));
    }
    return { escopo: linha.escopo, alvo: linha.alvo, valido };
  }

  private paraResposta(l: Linha): LinkResponse {
    return {
      id: l.id.toString(),
      token: l.token,
      escopo: l.escopo,
      alvo: l.alvo,
      expiraEm: l.expiraEm?.toISOString() ?? null,
      visitas: l.visitas,
      criadoEm: l.createdAt.toISOString(),
    };
  }
}
