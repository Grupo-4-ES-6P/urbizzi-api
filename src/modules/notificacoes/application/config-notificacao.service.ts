import { BadRequestException, Injectable } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { IsBoolean, IsIn, IsOptional } from "class-validator";
import { configNotificacaoSchema } from "../infra/schemas/config-notificacao.schema";

export const ANTECEDENCIAS = [12, 24, 48, 72] as const;

export interface ConfigAlerta {
  tipo: string;
  evento: string;
  quando: string;
  destinatario: string;
  ativo: boolean;
  email: boolean;
  /** Só para alertas antecipados (reserva perto de vencer). */
  antecedenciaHoras: number | null;
}

const PADRAO: readonly ConfigAlerta[] = [
  {
    tipo: "reserva_vencendo",
    evento: "Reserva perto de vencer",
    quando: "Antes do prazo da proposta pendente",
    destinatario: "Corretor da proposta e quem aprova propostas",
    ativo: true,
    email: false,
    antecedenciaHoras: 48,
  },
  {
    tipo: "reserva_expirada",
    evento: "Reserva expirada",
    quando: "No vencimento: a proposta é recusada e o lote volta a disponível",
    destinatario: "Corretor da proposta",
    ativo: true,
    email: false,
    antecedenciaHoras: null,
  },
  {
    tipo: "proposta_pendente",
    evento: "Proposta aguardando análise",
    quando: "Ao enviar a proposta",
    destinatario: "Quem aprova propostas",
    ativo: true,
    email: false,
    antecedenciaHoras: null,
  },
  {
    tipo: "proposta_decidida",
    evento: "Proposta aprovada ou recusada",
    quando: "Na decisão",
    destinatario: "Corretor da proposta",
    ativo: true,
    email: false,
    antecedenciaHoras: null,
  },
  {
    tipo: "interesse",
    evento: "Novo interesse pelo site",
    quando: "Ao receber o formulário do catálogo",
    destinatario: "Quem cria propostas",
    ativo: true,
    email: false,
    antecedenciaHoras: null,
  },
];

/** Tipos de notificação gravados que seguem a mesma configuração. */
const GRUPO: Record<string, string> = {
  proposta_aprovada: "proposta_decidida",
  proposta_recusada: "proposta_decidida",
};

export const grupoDoTipo = (tipo: string) => GRUPO[tipo] ?? tipo;

export class SalvarConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({ required: false, enum: ANTECEDENCIAS })
  @IsOptional()
  @IsIn(ANTECEDENCIAS)
  antecedenciaHoras?: number;
}

@Injectable()
export class ConfigNotificacaoService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listar(): Promise<ConfigAlerta[]> {
    const salvas = new Map(
      (await this.drizzle.db.select().from(configNotificacaoSchema)).map((c) => [c.tipo, c]),
    );
    return PADRAO.map((p) => {
      const c = salvas.get(p.tipo);
      if (!c) return { ...p };
      return {
        ...p,
        ativo: c.ativo,
        email: c.email,
        antecedenciaHoras: p.antecedenciaHoras === null ? null : (c.antecedenciaHoras ?? p.antecedenciaHoras),
      };
    });
  }

  async doTipo(tipo: string): Promise<ConfigAlerta | undefined> {
    const grupo = grupoDoTipo(tipo);
    return (await this.listar()).find((c) => c.tipo === grupo);
  }

  async salvar(tipo: string, dto: SalvarConfigDto): Promise<ConfigAlerta> {
    const atual = (await this.listar()).find((c) => c.tipo === tipo);
    if (!atual) throw new BadRequestException("Tipo de alerta desconhecido.");
    if (dto.antecedenciaHoras !== undefined && atual.antecedenciaHoras === null) {
      throw new BadRequestException("Este alerta não tem antecedência.");
    }
    const novo = {
      ativo: dto.ativo ?? atual.ativo,
      email: dto.email ?? atual.email,
      antecedenciaHoras: dto.antecedenciaHoras ?? atual.antecedenciaHoras,
      updatedAt: new Date(),
    };
    await this.drizzle.db
      .insert(configNotificacaoSchema)
      .values({ tipo, ...novo })
      .onConflictDoUpdate({ target: configNotificacaoSchema.tipo, set: novo });
    return { ...atual, ...novo };
  }
}
