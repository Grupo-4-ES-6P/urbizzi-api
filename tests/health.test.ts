import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("Health endpoint", () => {
  it("deve retornar status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "urbizzi-api"
    });
  });
});
