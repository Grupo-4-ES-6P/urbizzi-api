import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { SharedModule } from "@shared/shared.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AnexoModule } from "./modules/anexo/anexo.module";
import { AuthModule } from "./modules/auth/auth.module";
import { LogradouroModule } from "./modules/logradouro/logradouro.module";
import { BairroModule } from "./modules/bairro/bairro.module";
import { ClientesModule } from "./modules/clientes/clientes.module";
import { CidadeModule } from "./modules/cidade/cidade.module";
import { LoteamentoModule } from "./modules/loteamento/loteamento.module";
import { PermissoesModule } from "./modules/permissoes/permissoes.module";
import { PropostaModule } from "./modules/proposta/proposta.module";
import { RegistrosModule } from "./modules/registros/registros.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";
import { QuadraModule } from "@modules/quadra/quadra.module";
import { LoteModule } from "@modules/lote/lote.module";
import { NotificacoesModule } from "@modules/notificacoes/notificacoes.module";
import { LinksPublicosModule } from "@modules/links-publicos/links-publicos.module";
import { RelatoriosModule } from "@modules/relatorios/relatorios.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Só vale nas rotas com ThrottlerGuard (públicas e de senha)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    SharedModule,
    AnexoModule,
    AuthModule,
    CidadeModule,
    LoteamentoModule,
    PermissoesModule,
    PropostaModule,
    RegistrosModule,
    NotificacoesModule,
    LinksPublicosModule,
    RelatoriosModule,
    UsuariosModule,
    LogradouroModule,
    BairroModule,
    ClientesModule,
    QuadraModule,
    LoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
