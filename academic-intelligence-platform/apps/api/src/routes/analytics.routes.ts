import { Router } from "express";
import { getDashboard } from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/dashboard", getDashboard);
