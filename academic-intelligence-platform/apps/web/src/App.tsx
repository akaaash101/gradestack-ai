import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "./components/KpiCard";
import { RecommendationList } from "./components/RecommendationList";
import { RiskHeatmapTable } from "./components/RiskHeatmapTable";
import { StudyPlannerTable } from "./components/StudyPlannerTable";
import { fetchDashboard } from "./lib/api";
import { DashboardPayload } from "./types/analytics";

export function App() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });
  }, []);

  const courseComparison = useMemo(() => {
    if (!data) return [];
    return data.courseAnalytics.map((course) => ({
      course: course.courseCode,
      current: course.currentWeightedGrade,
      projected: course.projectedFinalGrade,
      impact: course.gpaImpactScore,
    }));
  }, [data]);

  if (loading) {
    return <div className="p-8 text-ink">Loading analytics dashboard...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-danger">Failed to load dashboard: {error}</div>;
  }

  return (
    <div className="min-h-screen p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-3xl bg-panel p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-wide text-muted">Deterministic Academic Intelligence</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">{data.studentName}</h1>
          <p className="mt-2 text-sm text-muted">Transparent analytics, forecasting, and rule-based recommendations.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Current GPA" value={data.gpaCurrent.toFixed(2)} />
          <KpiCard
            label="Projected GPA"
            value={data.semesterProjection.projectedGpa.toFixed(2)}
            detail={`Confidence ${data.semesterProjection.confidence}%`}
          />
          <KpiCard
            label="Semester Completion"
            value={`${data.semesterProjection.projectedCompletion}%`}
            detail="Based on weighted assessment completion"
          />
          <KpiCard
            label="Total Recommendations"
            value={String(data.recommendations.length)}
            detail="Algorithmic recommendations only"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-ink">GPA Trend Graph</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.gpaTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="movingAverage" stroke="#0f766e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-ink">Performance Forecasting</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#334155" />
                  <Bar dataKey="projected" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-ink">Completion Velocity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.velocity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completionRate" stroke="#0f766e" fill="#99f6e4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-ink">Study Efficiency Metrics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.gpaTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="productivity" stroke="#f59e0b" dot={false} />
                  <Line type="monotone" dataKey="studyHours" stroke="#1d4ed8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <RiskHeatmapTable courses={data.courseAnalytics} />
          <RecommendationList recommendations={data.recommendations} />
        </section>

        <section>
          <StudyPlannerTable plan={data.studyPlan} />
        </section>
      </div>
    </div>
  );
}
