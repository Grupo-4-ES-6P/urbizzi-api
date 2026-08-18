import type { Request, Response } from "express";

export function healthCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: "ok",
    service: "urbizzi-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
