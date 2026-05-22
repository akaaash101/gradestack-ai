import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

const analyticsService = new AnalyticsService();

export async function getDashboard(req: Request, res: Response) {
  try {
    const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
    const payload = await analyticsService.getDashboard(studentId);
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
}
