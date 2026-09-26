import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdministradorModule } from "./modules/administrador/administrador.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BairroModule } from "./modules/bairro/bairro.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AdministradorModule,
    AuthModule,
    UsuariosModule,
    BairroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
