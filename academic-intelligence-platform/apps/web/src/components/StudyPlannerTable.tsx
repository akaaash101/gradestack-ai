import { StudyPlanDay } from "../types/analytics";

type Props = {
  plan: StudyPlanDay[];
};

export function StudyPlannerTable({ plan }: Props) {
  return (
    <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-ink">Smart Weekly Study Planner</h3>
      <div className="mt-3 space-y-3">
        {plan.map((day) => (
          <div key={day.date} className="rounded-xl border border-slate-100 p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{day.date}</p>
              <p className="text-sm text-muted">{day.totalHours} hrs</p>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {day.tasks.map((task, index) => (
                <li key={`${task.courseCode}-${index}`} className="text-slate-700">
                  {task.courseCode}: {task.estimatedHours}h (priority {task.priorityScore})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
