import { Perfil } from "@modules/permissoes/domain/permissoes.catalogo";
import { StatusUsuario } from "@modules/usuarios/domain/models/usuario.entity";
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from "@modules/usuarios/domain/repositories/usuario-repository.interface";
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsuarioService } from "./usuario.service";

@Injectable()
export class UsuarioSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsuarioSeedService.name);

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly userRepository: UsuarioRepository,
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.promoverAdministradoresAntigos();
    await this.criarAdministradorInicial();
  }

  /** Usuários criados antes dos perfis com a permissão ADMIN viram Administrador. */
  private async promoverAdministradoresAntigos(): Promise<void> {
    try {
      const antigos = (await this.userRepository.findAll()).filter(
        (u) =>
          u.permissions.includes("ADMIN") && u.perfil !== Perfil.ADMINISTRADOR,
      );
      for (const usuario of antigos) {
        await this.usuarioService.update(usuario.id.toString(), {
          perfil: Perfil.ADMINISTRADOR,
        });
        this.logger.log(`Perfil Administrador atribuído a ${usuario.email}`);
      }
    } catch (error) {
      this.logger.error("Falha ao atualizar administradores antigos.", error);
    }
  }

  private async criarAdministradorInicial(): Promise<void> {
    const email = this.configService.get<string>("ADMIN_EMAIL")?.trim().toLowerCase();
    const password = this.configService.get<string>("ADMIN_PASSWORD");

    if (!email || !password) {
      return;
    }

    try {
      if (await this.userRepository.findByEmail(email)) {
        return;
      }

      await this.usuarioService.create({
        name: this.configService.get<string>("ADMIN_NAME") ?? "Administrador",
        email,
        password,
        status: StatusUsuario.ATIVO,
        perfil: Perfil.ADMINISTRADOR,
        permissions: [],
      });

      this.logger.log(`Administrador inicial criado: ${email}`);
    } catch (error) {
      this.logger.error("Falha ao criar o administrador inicial.", error);
    }
  }
}
