import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { SharedModule } from "@shared/shared.module";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";

@Module({
  imports: [
    SharedModule,
    JwtModule.register({}),
  ],
  controllers: [

  ],
  providers: [
    JwtAuthGuard,
    PermissoesGuard,
    /*
    {
      provide: ,
      useExisting: ,
    }
    */
  ],
  exports: [

  ],
})
export class LoteModule {}
