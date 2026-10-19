import { describe, expect, it, jest } from "@jest/globals";
import { AnexoService } from "@modules/anexo/application/services/anexo.service";
import { AnexoEntity } from "@modules/anexo/domain/models/anexo.entity";
import type { AnexoRepository } from "@modules/anexo/domain/repositories/anexo.repository";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Mocked } from "jest-mock";

const repository = (): Mocked<AnexoRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const anexo = new AnexoEntity({
  idAnexo: 1,
  tipoArquivo: "application/pdf",
  caminhoArquivo: "lotes/2/matricula.pdf",
  dataUpload: new Date("2026-10-19T12:00:00.000Z"),
});

describe("AnexoService", () => {
  it("cria normalizando tipo e caminho do arquivo", async () => {
    const repo = repository();
    repo.save.mockResolvedValue(anexo);
    const service = new AnexoService(repo);

    await expect(
      service.save({
        tipoArquivo: " Application/PDF ",
        caminhoArquivo: " lotes/2/matricula.pdf ",
      }),
    ).resolves.toBe(anexo);
    expect(repo.save).toHaveBeenCalledWith({
      tipoArquivo: "application/pdf",
      caminhoArquivo: "lotes/2/matricula.pdf",
    });
  });

  it("rejeita tipo de arquivo não permitido", async () => {
    const service = new AnexoService(repository());
    for (const tipoArquivo of ["", "text/html", "application/x-msdownload"]) {
      await expect(
        service.save({ tipoArquivo, caminhoArquivo: "lotes/a.pdf" }),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it("rejeita caminho vazio ou com path traversal", async () => {
    const service = new AnexoService(repository());
    for (const caminhoArquivo of [
      "  ",
      "../etc/passwd",
      "lotes/../../segredo.pdf",
      "lotes\\..\\segredo.pdf",
      "lotes/a\0.pdf",
    ]) {
      await expect(
        service.save({ tipoArquivo: "image/png", caminhoArquivo }),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it("busca e lista anexos", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(anexo);
    repo.findMany.mockResolvedValue([anexo]);
    const service = new AnexoService(repo);
    await expect(service.findById("1")).resolves.toBe(anexo);
    await expect(service.findMany()).resolves.toEqual([anexo]);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });

  it("rejeita identificadores inválidos", async () => {
    const service = new AnexoService(repository());
    for (const id of ["abc", "0", "-1", "1.5", "999999999999999999"]) {
      await expect(service.findById(id)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    }
  });

  it("retorna 404 quando o anexo não existe", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(null);
    repo.update.mockResolvedValue(null);
    const service = new AnexoService(repo);
    await expect(service.findById("9")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.updateById("9", { tipoArquivo: "image/png" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("atualiza apenas os campos informados", async () => {
    const repo = repository();
    const atualizado = new AnexoEntity({ ...anexo, tipoArquivo: "image/png" });
    repo.update.mockResolvedValue(atualizado);
    const service = new AnexoService(repo);
    await expect(
      service.updateById("1", { tipoArquivo: "IMAGE/PNG" }),
    ).resolves.toBe(atualizado);
    expect(repo.update).toHaveBeenCalledWith(1, { tipoArquivo: "image/png" });
  });

  it("retorna o anexo atual quando nada é alterado", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(anexo);
    const service = new AnexoService(repo);
    await expect(service.updateById("1", {})).resolves.toBe(anexo);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("remove e informa ausência", async () => {
    const repo = repository();
    repo.remove.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const service = new AnexoService(repo);
    await expect(service.removeById("1")).resolves.toBeUndefined();
    await expect(service.removeById("9")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
