import cors from "cors";
import express from "express";
import { analyticsRouter } from "./routes/analytics.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analytics", analyticsRouter);
