import { loteSchema } from "@modules/lote/infra/schemas/lote.schema";
import { loteamentoSchema } from "@modules/loteamento/infra/schemas/loteamento.schema";
import { BadRequestException, Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { and, eq } from "drizzle-orm";
import { InteressePublicoDto } from "../../application/dto/registro.dto";
import type { RegistroService } from "../../application/registro.service";
import { HISTORICO, INTERESSES } from "../../registros.config";

/** Campos de tela que não podem sair para o visitante. */
const DETALHES_INTERNOS = ["bloqueio", "observacao"];

function semDadosInternos(detalhes: Record<string, unknown>) {
  const publico = Object.fromEntries(Object.entries(detalhes).filter(([chave]) => !DETALHES_INTERNOS.includes(chave)));
  const valores = detalhes.valores as Record<string, unknown> | undefined;
  if (valores) publico.valores = { ...valores, minimo: null };
  return publico;
}

/** Rotas sem login usadas pelo site público (catálogo e interesse). */
@ApiTags("publico")
@Controller("publico")
export class PublicoController {
  constructor(
    private readonly drizzle: DrizzleService,
    @Inject(INTERESSES) private readonly interesses: RegistroService,
    @Inject(HISTORICO) private readonly historico: RegistroService,
  ) {}

  @Get("catalogo")
  async catalogo() {
    const lotes = await this.drizzle.db.select().from(loteSchema).where(eq(loteSchema.publicado, true));
    const loteamentos = await this.drizzle.db.select().from(loteamentoSchema);

    return {
      imoveis: lotes
        .filter((l) => (l.detalhes as { status?: string }).status !== "rascunho")
        .map((l) => ({
          id: l.id.toString(),
          matricula: l.matricula,
          tipo: l.tipo,
          areaQuadrada: l.areaQuadrada,
          valor: l.valor,
          estado: l.estado,
          informacoesComplementares: null,
          latitude: l.latitude,
          longitude: l.longitude,
          publicado: l.publicado,
          idQuadra: l.idQuadra?.toString() ?? null,
          detalhes: semDadosInternos(l.detalhes),
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        })),
      loteamentos: loteamentos.map((l) => ({
        idLoteamento: l.idLoteamento,
        nome: l.nome,
        codigo: l.codigo,
        situacao: l.situacao,
        cep: l.cep,
        endereco: l.endereco,
        bairro: l.bairro,
        cidade: l.cidade,
        uf: l.uf,
        latitude: l.latitude,
        longitude: l.longitude,
      })),
    };
  }

  @Post("interesses")
  async registrarInteresse(@Body() body: InteressePublicoDto) {
    const [lote] = await this.drizzle.db
      .select({ id: loteSchema.id })
      .from(loteSchema)
      .where(and(eq(loteSchema.id, BigInt(body.idLote)), eq(loteSchema.publicado, true)))
      .limit(1);
    if (!lote) throw new BadRequestException("Imóvel indisponível no catálogo.");

    const criado = await this.interesses.criar({
      codigo: body.codigo ?? null,
      idLote: body.idLote,
      status: "novo",
      data: new Date().toISOString(),
      detalhes: {
        nome: body.nome.trim(),
        email: body.email.trim().toLowerCase(),
        telefone: body.telefone?.trim() ?? "",
        mensagem: body.mensagem?.trim() ?? "",
      },
    });
    await this.historico.criar({
      idLote: body.idLote,
      status: "Interesse",
      data: new Date().toISOString(),
      detalhes: {
        descricao: `Formulário recebido pelo catálogo público (${body.nome.trim()})`,
        autor: "Catálogo público",
        referencia: criado.codigo,
        situacao: { rotulo: "Disponível", variante: "normal" },
      },
    });
    return { id: criado.id, codigo: criado.codigo };
  }
}
