import { QuadraService } from "@modules/quadra/application/services/quadra.service";
import { QuadraBuilder } from "@modules/quadra/domain/builders/quadra.builder";
import type { QuadraRepository } from "@modules/quadra/domain/repositories/quadra.repository.interface";
import { QuadraController } from "@modules/quadra/infra/controllers/quadra.controller";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

const quadra = (id: bigint, identificacao = "01", idLoteamento = 3n) =>
    new QuadraBuilder(id).withIdentificacao(identificacao).withIdLoteamento(idLoteamento).withArea(1200).build();

const makeRepository = (): jest.Mocked<QuadraRepository> => ({
    create: jest.fn(async (q) => new QuadraBuilder(10n).withIdentificacao(q.identificacao).withIdLoteamento(q.idLoteamento).withArea(q.area).withTestadaPara(q.testadaPara).build()),
    update: jest.fn(async (q) => q),
    delete: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(quadra(1n)),
    findByIdentificacao: jest.fn().mockResolvedValue(null),
    loteamentoExiste: jest.fn().mockResolvedValue(true),
});

describe("QuadraService", () => {
    it("cria a quadra no loteamento informado", async () => {
        const repository = makeRepository();
        const resposta = await new QuadraService(repository).create({
            identificacao: " 07 ",
            idLoteamento: 3,
            area: 4800,
            testadaPara: " Rua A ",
        });

        expect(repository.findByIdentificacao).toHaveBeenCalledWith(3n, "07");
        expect(resposta).toMatchObject({ id: "10", identificacao: "07", idLoteamento: "3", area: 4800, testadaPara: "Rua A" });
    });

    it("permite a mesma identificação em outro loteamento, mas não no mesmo", async () => {
        const repository = makeRepository();
        const service = new QuadraService(repository);
        repository.findByIdentificacao.mockImplementation(async (lot) => (lot === 3n ? quadra(2n) : null));

        await expect(service.create({ identificacao: "01", idLoteamento: 3 })).rejects.toBeInstanceOf(ConflictException);
        await expect(service.create({ identificacao: "01", idLoteamento: 4 })).resolves.toMatchObject({ idLoteamento: "4" });
    });

    it("recusa loteamento inexistente com 400, e não com erro de banco", async () => {
        const repository = makeRepository();
        repository.loteamentoExiste.mockResolvedValue(false);

        await expect(
            new QuadraService(repository).create({ identificacao: "01", idLoteamento: 99 }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it("edita mantendo a própria identificação e o loteamento quando não enviados", async () => {
        const repository = makeRepository();
        repository.findByIdentificacao.mockResolvedValue(quadra(1n));

        const resposta = await new QuadraService(repository).update("1", { area: null });

        expect(resposta).toMatchObject({ identificacao: "01", idLoteamento: "3", area: null });
    });

    it("exclui e responde 404 para quadra inexistente", async () => {
        const repository = makeRepository();
        const service = new QuadraService(repository);

        await service.delete("1");
        expect(repository.delete).toHaveBeenCalledWith(1n);

        repository.findById.mockResolvedValue(null);
        await expect(service.delete("2")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("filtra por loteamento na listagem", async () => {
        const repository = makeRepository();
        await new QuadraService(repository).findAll("3");
        expect(repository.findAll).toHaveBeenCalledWith({ idLoteamento: 3n });
    });

    it("o controller delega a exclusão ao service (antes chamava a si mesmo)", async () => {
        const service = { delete: jest.fn() } as unknown as jest.Mocked<QuadraService>;
        await new QuadraController(service).delete("5");
        expect(service.delete).toHaveBeenCalledWith("5");
    });
});
