import { CreateLoteDto } from "@modules/lote/application/dto/lote-create.dto";
import { LoteService } from "@modules/lote/application/service/lote.service";
import { LoteBuilder } from "@modules/lote/domain/builder/lote.builder";
import type { Lote } from "@modules/lote/domain/model/lote.entity";
import type { LoteRepository } from "@modules/lote/domain/repository/lote.repository.interface";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const lote = (id: bigint, matricula: string | null = "M-1") =>
    new LoteBuilder(id)
        .withMatricula(matricula)
        .withTipo("terreno")
        .withAreaQuadrada(360)
        .withValor(90000)
        .withEstado("disponivel")
        .withInformacoesComplementares("Esquina")
        .withPublicado(true)
        .withIdQuadra(1n)
        .withIdAnexo(5n)
        .withDetalhes({ codigo: "10" })
        .build();

const makeRepository = (): jest.Mocked<LoteRepository> => ({
    create: jest.fn(async (l: Lote) => new LoteBuilder(9n).withTipo(l.tipo).withEstado(l.estado).withPublicado(l.publicado).withIdQuadra(l.idQuadra).withIdAnexo(l.idAnexo).withDetalhes(l.detalhes).build()),
    update: jest.fn(async (l: Lote) => l),
    delete: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(lote(1n)),
    findByMatricula: jest.fn().mockResolvedValue(null),
});

const base = { tipo: "terreno", estado: "disponivel", publicado: false, idQuadra: 1 };

describe("LoteService", () => {
    it("cria lote sem anexo, sem logradouro e em rascunho (sem área/valor)", async () => {
        const repository = makeRepository();
        const resposta = await new LoteService(repository).create({ ...base, matricula: "  ", detalhes: { codigo: "12" } });

        expect(repository.findByMatricula).not.toHaveBeenCalled();
        expect(resposta).toMatchObject({ id: "9", idAnexo: null, idLogradouro: null, detalhes: { codigo: "12" } });
    });

    it("recusa matrícula repetida em outro lote", async () => {
        const repository = makeRepository();
        repository.findByMatricula.mockResolvedValue(lote(2n));

        await expect(new LoteService(repository).create({ ...base, matricula: "M-1" })).rejects.toBeInstanceOf(
            ConflictException,
        );
    });

    it("edita mantendo a própria matrícula (antes conflitava consigo mesmo)", async () => {
        const repository = makeRepository();
        repository.findByMatricula.mockResolvedValue(lote(1n));

        await expect(new LoteService(repository).update("1", { matricula: "M-1", valor: 95000 })).resolves.toMatchObject({
            valor: 95000,
            matricula: "M-1",
        });
    });

    it("na edição, ausente mantém e null apaga", async () => {
        const repository = makeRepository();

        const resposta = await new LoteService(repository).update("1", { informacoesComplementares: null, idAnexo: null });

        expect(resposta).toMatchObject({ informacoesComplementares: null, idAnexo: null, areaQuadrada: 360, detalhes: { codigo: "10" } });
    });

    it("responde ids sem formatação e datas em ISO", async () => {
        const repository = makeRepository();
        repository.findById.mockResolvedValue(new LoteBuilder(1234n).withTipo("t").withEstado("disponivel").withPublicado(true).withIdQuadra(1n).withIdAnexo(1234n).build());

        const resposta = await new LoteService(repository).findById("1234");

        expect(resposta.idAnexo).toBe("1234");
        expect(resposta.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("filtra por quadra e responde 404 para lote inexistente", async () => {
        const repository = makeRepository();
        const service = new LoteService(repository);

        await service.findAll({ idQuadra: "3" });
        expect(repository.findAll).toHaveBeenCalledWith(expect.objectContaining({ idQuadra: 3n }));

        repository.findById.mockResolvedValue(null);
        await expect(service.delete("7")).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe("CreateLoteDto", () => {
    it("aceita números comuns (antes @IsDecimal recusava tudo) e valida o estado", async () => {
        const valido = plainToInstance(CreateLoteDto, { ...base, areaQuadrada: 360.5, valor: 90000, latitude: -24.7 });
        const invalido = plainToInstance(CreateLoteDto, { ...base, estado: "alugado" });

        expect(await validate(valido)).toHaveLength(0);
        expect((await validate(invalido)).map((e) => e.property)).toEqual(["estado"]);
    });
});
