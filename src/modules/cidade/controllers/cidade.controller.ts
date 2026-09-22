import type { Request, Response } from "express";
import { HttpError } from "../../../shared/errors/http-error";
import { CidadeService } from "../services/cidade.service";
import { DrizzleCidadeRepository } from "../repositories/drizzle-cidade.repository";
import { InMemoryCidadeRepository } from "../repositories/in-memory-cidade.repository";

let cidadeService = new CidadeService(new DrizzleCidadeRepository());
let testRepository: InMemoryCidadeRepository | null = null;

function parseId(value: string | string[]): number {
  if (Array.isArray(value)) {
    return Number.NaN;
  }

  return Number(value);
}

function handleError(error: unknown, res: Response): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: "Erro interno do servidor." });
}

export async function createCidade(req: Request, res: Response): Promise<void> {
  try {
    const cidade = await cidadeService.create(req.body);

    res.status(201).json(cidade);
  } catch (error) {
    handleError(error, res);
  }
}

export async function findAllCidades(_req: Request, res: Response): Promise<void> {
  try {
    const cidades = await cidadeService.findAll();

    res.status(200).json(cidades);
  } catch (error) {
    handleError(error, res);
  }
}

export async function findCidadeById(req: Request, res: Response): Promise<void> {
  try {
    const cidade = await cidadeService.findById(parseId(req.params.id));

    res.status(200).json(cidade);
  } catch (error) {
    handleError(error, res);
  }
}

export async function updateCidade(req: Request, res: Response): Promise<void> {
  try {
    const cidade = await cidadeService.update(parseId(req.params.id), req.body);

    res.status(200).json(cidade);
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteCidade(req: Request, res: Response): Promise<void> {
  try {
    await cidadeService.delete(parseId(req.params.id));

    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
}

export function resetCidadeRepositoryForTests(): void {
  if (!testRepository) {
    testRepository = new InMemoryCidadeRepository();
    cidadeService = new CidadeService(testRepository);
    return;
  }

  testRepository.clear();
}
