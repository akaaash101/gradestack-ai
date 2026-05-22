import { CourseAnalytics } from "../types/analytics";

type Props = {
  courses: CourseAnalytics[];
};

function scoreToColor(score: number): string {
  if (score >= 75) return "bg-red-100 text-red-800";
  if (score >= 55) return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export function RiskHeatmapTable({ courses }: Props) {
  return (
    <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-ink">Risk Heatmap</h3>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2">Course</th>
              <th className="pb-2">Risk</th>
              <th className="pb-2">Burnout</th>
              <th className="pb-2">Difficulty</th>
              <th className="pb-2">Completion</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.courseId} className="border-t border-slate-100">
                <td className="py-2 font-medium text-ink">{course.courseCode}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-1 text-xs ${scoreToColor(course.riskScore)}`}>{course.riskScore}%</span>
                </td>
                <td className="py-2">
                  <span className={`rounded px-2 py-1 text-xs ${scoreToColor(course.burnoutRisk)}`}>{course.burnoutRisk}%</span>
                </td>
                <td className="py-2">{course.difficultyScore}%</td>
                <td className="py-2">{course.completionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
