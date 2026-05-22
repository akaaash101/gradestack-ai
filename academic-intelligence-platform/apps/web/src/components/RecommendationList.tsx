import { Recommendation } from "../types/analytics";

type Props = {
  recommendations: Recommendation[];
};

function severityClass(severity: Recommendation["severity"]): string {
  if (severity === "high") return "bg-red-50 text-red-800 border-red-200";
  if (severity === "medium") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-teal-50 text-teal-800 border-teal-200";
}

export function RecommendationList({ recommendations }: Props) {
  return (
    <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-ink">Rule-Based Recommendations</h3>
      <div className="mt-3 space-y-2">
        {recommendations.map((item) => (
          <div key={item.id} className={`rounded-lg border p-3 text-sm ${severityClass(item.severity)}`}>
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );
}
