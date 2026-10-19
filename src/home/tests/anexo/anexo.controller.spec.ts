import type { AnexoService } from "@modules/anexo/application/services/anexo.service";
import { AnexoEntity } from "@modules/anexo/domain/models/anexo.entity";
import { AnexoController } from "@modules/anexo/infra/controllers/anexo.controller";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { PERMISSOES_KEY } from "@shared/decorators/permissoes.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { PermissoesGuard } from "@shared/guards/permissoes.guard";

const anexo = new AnexoEntity({
  idAnexo: 1,
  tipoArquivo: "application/pdf",
  caminhoArquivo: "lotes/2/matricula.pdf",
  dataUpload: new Date("2026-10-19T12:00:00.000Z"),
});

describe("AnexoController", () => {
  it("cria e serializa a data de upload", async () => {
    const service = {
      save: jest.fn().mockResolvedValue(anexo),
    } as unknown as jest.Mocked<AnexoService>;
    const controller = new AnexoController(service);
    const body = {
      tipoArquivo: "application/pdf",
      caminhoArquivo: "lotes/2/matricula.pdf",
    };
    expect(await controller.save(body)).toEqual({
      idAnexo: 1,
      tipoArquivo: "application/pdf",
      caminhoArquivo: "lotes/2/matricula.pdf",
      dataUpload: "2026-10-19T12:00:00.000Z",
    });
    expect(service.save).toHaveBeenCalledWith(body);
  });

  it("delega listagem, busca, atualização e remoção", async () => {
    const service = {
      findMany: jest.fn().mockResolvedValue([anexo]),
      findById: jest.fn().mockResolvedValue(anexo),
      updateById: jest.fn().mockResolvedValue(anexo),
      removeById: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AnexoService>;
    const controller = new AnexoController(service);
    expect(await controller.findMany()).toHaveLength(1);
    expect((await controller.findById("1")).idAnexo).toBe(1);
    await controller.update("1", { tipoArquivo: "image/png" });
    await controller.remove("1");
    expect(service.updateById).toHaveBeenCalledWith("1", {
      tipoArquivo: "image/png",
    });
    expect(service.removeById).toHaveBeenCalledWith("1");
  });

  it("protege rotas com autenticação e permissões de anexo", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AnexoController)).toEqual([
      JwtAuthGuard,
      PermissoesGuard,
    ]);
    const permissoes = (handler: keyof AnexoController) =>
      Reflect.getMetadata(PERMISSOES_KEY, AnexoController.prototype[handler]);
    expect(permissoes("save")).toEqual(["ANEXO_CRIAR"]);
    expect(permissoes("findMany")).toEqual(["ANEXO_VISUALIZAR"]);
    expect(permissoes("findById")).toEqual(["ANEXO_VISUALIZAR"]);
    expect(permissoes("update")).toEqual(["ANEXO_ATUALIZAR"]);
    expect(permissoes("remove")).toEqual(["ANEXO_EXCLUIR"]);
  });
});
