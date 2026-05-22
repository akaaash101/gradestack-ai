import { DashboardPayload } from "../types/analytics";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export async function fetchDashboard(studentId?: string): Promise<DashboardPayload> {
  const query = studentId ? `?studentId=${studentId}` : "";
  const response = await fetch(`${API_BASE}/analytics/dashboard${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json() as Promise<DashboardPayload>;
}
