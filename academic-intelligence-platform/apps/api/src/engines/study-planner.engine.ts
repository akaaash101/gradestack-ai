import dayjs from "dayjs";
import { CourseAnalytics, StudyPlanDay, StudyTask } from "../types/analytics.js";
import { clamp, round } from "../utils/math.js";

export class StudyPlannerEngine {
  buildWeeklyPlan(courseAnalytics: CourseAnalytics[]): StudyPlanDay[] {
    const dailyCapacity = 3.5;
    const days = Array.from({ length: 7 }, (_, i) => dayjs().add(i, "day"));

    const tasks: StudyTask[] = courseAnalytics
      .map((course) => {
        const deadlineUrgency = clamp((course.remainingWeight / 100) * 70 + (course.riskScore / 100) * 30, 0, 100);
        const priorityScore = clamp(
          0.35 * course.gpaImpactScore +
            0.25 * course.riskScore +
            0.2 * course.difficultyScore +
            0.2 * Math.max(0, 100 - course.currentWeightedGrade),
          0,
          100
        );

        return {
          courseCode: course.courseCode,
          title: course.title,
          priorityScore: round(priorityScore),
          deadlineUrgency: round(deadlineUrgency),
          estimatedHours: round(course.recommendedStudyHoursNext7Days, 1),
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    const taskQueues = tasks.map((task) => ({ ...task }));

    return days.map((day) => {
      let remaining = dailyCapacity;
      const assigned: StudyTask[] = [];

      for (const task of taskQueues) {
        if (task.estimatedHours <= 0 || remaining <= 0) continue;
        const assignHours = Math.min(task.estimatedHours, remaining, 2);
        if (assignHours <= 0.25) continue;

        assigned.push({
          ...task,
          estimatedHours: round(assignHours, 1),
        });

        task.estimatedHours = round(task.estimatedHours - assignHours, 1);
        remaining = round(remaining - assignHours, 1);
      }

      return {
        date: day.format("YYYY-MM-DD"),
        totalHours: round(assigned.reduce((sum, task) => sum + task.estimatedHours, 0), 1),
        tasks: assigned,
      };
    });
  }
}
