import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import {
  IDS_PERMISSOES,
  MATRIZ_PADRAO,
  type MatrizPermissoes,
  Perfil,
  PERMISSAO_TRAVADA,
  PERMISSOES_SISTEMA,
  type PermissaoSistema,
  PERFIS,
  permissoesDoPerfil,
} from "../../domain/permissoes.catalogo";
import {
  PERFIL_PERMISSAO_REPOSITORY,
  type PerfilPermissaoRepository,
} from "../../domain/repositories/perfil-permissao.repository";
import type { AlterarPermissaoDto } from "../dto/alterar-permissao.dto";

export interface MatrizResponse {
  perfis: Perfil[];
  permissoes: typeof PERMISSOES_SISTEMA;
  matriz: MatrizPermissoes;
}

@Injectable()
export class PermissaoService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissaoService.name);

  constructor(
    @Inject(PERFIL_PERMISSAO_REPOSITORY)
    private readonly repository: PerfilPermissaoRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      if (!(await this.repository.isEmpty())) return;

      await this.repository.insertMany(
        PERMISSOES_SISTEMA.flatMap(({ id }) =>
          MATRIZ_PADRAO[id].map((perfil) => ({ perfil, permissao: id })),
        ),
      );
      this.logger.log("Matriz de permissões padrão criada.");
    } catch (error) {
      this.logger.error("Falha ao criar a matriz de permissões padrão.", error);
    }
  }

  async obterMatriz(): Promise<MatrizResponse> {
    const matriz = Object.fromEntries(
      PERMISSOES_SISTEMA.map(({ id }) => [id, [] as Perfil[]]),
    ) as MatrizPermissoes;

    for (const { perfil, permissao } of await this.repository.findAll()) {
      matriz[permissao as PermissaoSistema]?.push(perfil);
    }

    return { perfis: PERFIS, permissoes: PERMISSOES_SISTEMA, matriz };
  }

  async alterar(dto: AlterarPermissaoDto): Promise<MatrizResponse> {
    const permissao = dto.permissao.trim().toUpperCase();

    if (!IDS_PERMISSOES.includes(permissao)) {
      throw new BadRequestException("Permissão inválida.");
    }

    if (
      permissao === PERMISSAO_TRAVADA &&
      dto.perfil === Perfil.ADMINISTRADOR &&
      !dto.liberado
    ) {
      throw new BadRequestException(
        "O administrador sempre gerencia usuários e permissões.",
      );
    }

    const item = { perfil: dto.perfil, permissao };
    if (dto.liberado) {
      await this.repository.insertMany([item]);
    } else {
      await this.repository.remove(item);
    }

    return this.obterMatriz();
  }

  async permissoesDoUsuario(
    perfil: Perfil,
    extras: string[] = [],
  ): Promise<string[]> {
    const { matriz } = await this.obterMatriz();
    return permissoesDoPerfil(perfil, matriz, extras);
  }
}
