import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
import { PropostaModule } from "./modules/proposta/proposta.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";
import { QuadraModule } from "@modules/quadra/quadra.module";
import { LoteModule } from "@modules/lote/lote.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AnexoModule,
    AuthModule,
    CidadeModule,
    LoteamentoModule,
    PropostaModule,
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
