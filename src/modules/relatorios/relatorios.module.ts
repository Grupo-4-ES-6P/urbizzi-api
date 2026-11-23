import { usuariosSchema } from "@modules/usuarios/infra/schemas/usuario.schema";
import { Body, Controller, Get, Module, Post, Req, UseGuards } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { Permissoes } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard, type RequestAuthUser } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";
import { DrizzleService } from "@shared/infra/database/drizzle/drizzle.service";
import { SharedModule } from "@shared/shared.module";
import { IsIn, IsInt, IsString, MaxLength, Min } from "class-validator";
import { desc, eq } from "drizzle-orm";
import { relatorioGeradoSchema } from "./infra/schemas/relatorio.schema";

class RegistrarRelatorioDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  nome!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  periodo!: string;

  @ApiProperty({ enum: ["CSV", "PDF"] })
  @IsIn(["CSV", "PDF"])
  formato!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  registros!: number;
}

/** O arquivo é gerado no navegador; a API guarda quem gerou o quê e quando. */
@ApiTags("relatorios")
@UseGuards(JwtAuthGuard, PermissoesGuard)
@Permissoes("EMITIR_RELATORIOS")
@Controller("relatorios")
export class RelatorioController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Get()
  async listar() {
    const linhas = await this.drizzle.db
      .select({
        id: relatorioGeradoSchema.id,
        nome: relatorioGeradoSchema.nome,
        periodo: relatorioGeradoSchema.periodo,
        formato: relatorioGeradoSchema.formato,
        registros: relatorioGeradoSchema.registros,
        geradoPor: usuariosSchema.name,
        criadoEm: relatorioGeradoSchema.createdAt,
      })
      .from(relatorioGeradoSchema)
      .leftJoin(usuariosSchema, eq(usuariosSchema.id, relatorioGeradoSchema.idUsuario))
      .orderBy(desc(relatorioGeradoSchema.createdAt), desc(relatorioGeradoSchema.id))
      .limit(50);
    return linhas.map((l) => ({ ...l, id: l.id.toString(), geradoPor: l.geradoPor ?? "—", criadoEm: l.criadoEm.toISOString() }));
  }

  @Post()
  async registrar(@Body() body: RegistrarRelatorioDto, @Req() req: { user: RequestAuthUser }) {
    const [linha] = await this.drizzle.db
      .insert(relatorioGeradoSchema)
      .values({ ...body, idUsuario: /^\d+$/.test(req.user.sub) ? BigInt(req.user.sub) : null })
      .returning({ id: relatorioGeradoSchema.id });
    return { id: linha.id.toString() };
  }
}

@Module({
  imports: [SharedModule, JwtModule.register({})],
  controllers: [RelatorioController],
  providers: [JwtAuthGuard, PermissoesGuard],
})
export class RelatoriosModule {}
