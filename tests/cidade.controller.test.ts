import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import { resetCidadeRepositoryForTests } from "../src/modules/cidade/controllers/cidade.controller";

describe("Cidade endpoints", () => {
  beforeEach(() => {
    resetCidadeRepositoryForTests();
  });

  it("deve criar uma cidade", async () => {
    const response = await request(app).post("/api/cidades").send({ nome: "Campinas" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      idCidade: 1,
      nome: "Campinas"
    });
  });

  it("deve listar cidades", async () => {
    await request(app).post("/api/cidades").send({ nome: "Campinas" });

    const response = await request(app).get("/api/cidades");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("deve buscar cidade por ID", async () => {
    await request(app).post("/api/cidades").send({ nome: "Campinas" });

    const response = await request(app).get("/api/cidades/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      idCidade: 1,
      nome: "Campinas"
    });
  });

  it("deve atualizar uma cidade", async () => {
    await request(app).post("/api/cidades").send({ nome: "Campinas" });

    const response = await request(app).put("/api/cidades/1").send({ nome: "Santos" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      idCidade: 1,
      nome: "Santos"
    });
  });

  it("deve excluir uma cidade", async () => {
    await request(app).post("/api/cidades").send({ nome: "Campinas" });

    const response = await request(app).delete("/api/cidades/1");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("deve retornar 400 para payload inválido", async () => {
    const response = await request(app).post("/api/cidades").send({ nome: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Nome da cidade não pode estar vazio."
    });
  });

  it("deve retornar 404 para cidade inexistente", async () => {
    const response = await request(app).get("/api/cidades/99");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Cidade não encontrada."
    });
  });
});
