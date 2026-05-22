import dayjs from "dayjs";
import { GoalType } from "@prisma/client";
import { CourseAnalytics, SemesterProjection, TrendPoint, VelocityPoint } from "../types/analytics.js";
import { StudentAcademicData } from "../types/data.js";
import { avg, clamp, round } from "../utils/math.js";
import { toIsoDate } from "../utils/date.js";

export class AcademicAnalyticsEngine {
  buildCourseAnalytics(student: StudentAcademicData): CourseAnalytics[] {
    const byCourse = student.courses.map((course) => {
      const assessments = course.assessments;

      const completed = assessments
        .map((assessment) => ({ assessment, submission: assessment.submissions[0] }))
        .filter((item) => Boolean(item.submission));

      const completedWeight = completed.reduce((sum, item) => sum + item.assessment.weight, 0);
      const weightedAchieved = completed.reduce((sum, item) => {
        const score = item.submission?.score ?? 0;
        return sum + (score / 100) * item.assessment.weight;
      }, 0);

      const currentWeightedGrade = completedWeight === 0 ? 0 : (weightedAchieved / completedWeight) * 100;
      const remainingWeight = 100 - completedWeight;

      const assignmentScores = completed.map((item) => item.submission?.score ?? 0);
      const performanceVolatility = this.stdDev(assignmentScores);
      const trendSlope = this.computeSlope(
        completed.map((item) => ({
          x: dayjs(item.submission?.submittedAt).valueOf(),
          y: item.submission?.score ?? 0,
        }))
      );

      const baselineProjection = currentWeightedGrade + trendSlope * 2;
      const projectedFinalGrade = clamp(
        remainingWeight > 0
          ? weightedAchieved + (remainingWeight * clamp(baselineProjection, 45, 98)) / 100
          : weightedAchieved,
        0,
        100
      );

      const completionRate = assessments.length ? (completed.length / assessments.length) * 100 : 0;
      const lateCount = completed.filter((item) => item.submission?.isLate).length;
      const dueSoonCount = assessments.filter((assessment) => dayjs(assessment.dueDate).isBefore(dayjs().add(10, "day"))).length;
      const riskScore = clamp(
        0.45 * (100 - currentWeightedGrade) +
          0.2 * performanceVolatility +
          0.2 * ((lateCount / Math.max(1, completed.length)) * 100) +
          0.15 * ((dueSoonCount / Math.max(1, assessments.length)) * 100),
        0,
        100
      );

      const weeklySessions = student.studySessions.filter(
        (session) => session.courseCode === course.code && dayjs(session.date).isAfter(dayjs().subtract(7, "day"))
      );
      const priorWeeklySessions = student.studySessions.filter(
        (session) =>
          session.courseCode === course.code &&
          dayjs(session.date).isAfter(dayjs().subtract(14, "day")) &&
          dayjs(session.date).isBefore(dayjs().subtract(7, "day"))
      );

      const studyHoursLast7Days = weeklySessions.reduce((sum, item) => sum + item.durationHrs, 0);
      const priorHours = priorWeeklySessions.reduce((sum, item) => sum + item.durationHrs, 0);
      const burnoutRisk = clamp(
        35 + Math.max(0, studyHoursLast7Days - 18) * 2.5 + Math.max(0, priorHours - studyHoursLast7Days) * 1.2,
        0,
        100
      );

      const difficultyScore = clamp(
        40 + course.difficultyBase * 25 + performanceVolatility * 0.7 + Math.max(0, 80 - currentWeightedGrade) * 0.2,
        0,
        100
      );

      const gpaImpactScore = clamp((course.creditHours / 3) * (100 - currentWeightedGrade) * 0.9 + remainingWeight * 0.4, 0, 100);

      const requiredAverageForTarget =
        course.targetGrade && remainingWeight > 0
          ? round(((course.targetGrade - weightedAchieved) / remainingWeight) * 100)
          : null;

      const recommendedStudyHoursNext7Days = round(
        clamp(6 + riskScore * 0.07 + remainingWeight * 0.04 + (course.difficultyBase - 1) * 4, 4, 22),
        1
      );

      return {
        courseId: course.id,
        courseCode: course.code,
        title: course.title,
        currentWeightedGrade: round(currentWeightedGrade),
        projectedFinalGrade: round(projectedFinalGrade),
        difficultyScore: round(difficultyScore),
        riskScore: round(riskScore),
        burnoutRisk: round(burnoutRisk),
        completionRate: round(completionRate),
        gpaImpactScore: round(gpaImpactScore),
        requiredAverageForTarget,
        remainingWeight: round(remainingWeight),
        studyHoursLast7Days: round(studyHoursLast7Days),
        recommendedStudyHoursNext7Days,
      };
    });

    return byCourse.sort((a, b) => b.gpaImpactScore - a.gpaImpactScore);
  }

  buildGpaTrend(student: StudentAcademicData, courseAnalytics: CourseAnalytics[]): TrendPoint[] {
    const days = Array.from({ length: 28 }, (_, i) => dayjs().subtract(27 - i, "day"));
    return days.map((day) => {
      const sessions = student.studySessions.filter((session) => dayjs(session.date).isSame(day, "day"));
      const studyHours = sessions.reduce((sum, s) => sum + s.durationHrs, 0);
      const productivity = avg(sessions.map((s) => s.productivity));

      const courseSignal = avg(
        courseAnalytics.map((course) => {
          const momentum = clamp((course.currentWeightedGrade + course.projectedFinalGrade) / 2, 0, 100);
          return momentum;
        })
      );

      const movingAverage = clamp(courseSignal + (studyHours - 2) * 0.8 + (productivity - 3) * 3, 0, 100);

      return {
        date: toIsoDate(day.toDate()),
        movingAverage: round(movingAverage),
        productivity: round(productivity),
        studyHours: round(studyHours),
      };
    });
  }

  buildVelocity(student: StudentAcademicData): VelocityPoint[] {
    const weeks = Array.from({ length: 6 }, (_, i) => dayjs().startOf("week").subtract(5 - i, "week"));

    return weeks.map((start) => {
      const end = start.add(7, "day");
      const allAssessments = student.courses.flatMap((course) => course.assessments);
      const dueInWeek = allAssessments.filter((assessment) =>
        dayjs(assessment.dueDate).isAfter(start) && dayjs(assessment.dueDate).isBefore(end)
      );

      const completedInWeek = dueInWeek.filter((assessment) => Boolean(assessment.submissions[0]));
      const completedWeight = completedInWeek.reduce((sum, item) => sum + item.weight, 0);
      const dueWeight = dueInWeek.reduce((sum, item) => sum + item.weight, 0);

      return {
        week: start.format("MMM D"),
        completedWeight: round(completedWeight),
        completionRate: dueWeight === 0 ? 100 : round((completedWeight / dueWeight) * 100),
      };
    });
  }

  buildSemesterProjection(student: StudentAcademicData, courseAnalytics: CourseAnalytics[]): SemesterProjection {
    const projectedGpa = this.toGpa(avg(courseAnalytics.map((course) => course.projectedFinalGrade)));

    const gpaGoal = student.goals.find((goal) => goal.goalType === GoalType.GPA);
    const targetGpa = gpaGoal ? gpaGoal.targetValue : null;

    const confidence = clamp(
      78 - avg(courseAnalytics.map((course) => Math.abs(course.projectedFinalGrade - course.currentWeightedGrade))) * 0.9,
      45,
      96
    );

    const projectedCompletion = round(avg(courseAnalytics.map((course) => 100 - course.remainingWeight)));

    return {
      projectedGpa: round(projectedGpa),
      targetGpa,
      confidence: round(confidence),
      projectedCompletion,
    };
  }

  buildCurrentGpa(courseAnalytics: CourseAnalytics[]): number {
    return round(this.toGpa(avg(courseAnalytics.map((course) => course.currentWeightedGrade))));
  }

  private toGpa(percentage: number): number {
    if (percentage >= 90) return 4.0;
    if (percentage >= 85) return 3.9;
    if (percentage >= 80) return 3.7;
    if (percentage >= 77) return 3.3;
    if (percentage >= 73) return 3.0;
    if (percentage >= 70) return 2.7;
    if (percentage >= 67) return 2.3;
    if (percentage >= 63) return 2.0;
    if (percentage >= 60) return 1.7;
    if (percentage >= 57) return 1.3;
    if (percentage >= 53) return 1.0;
    if (percentage >= 50) return 0.7;
    return 0;
  }

  private stdDev(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = avg(values);
    const variance = avg(values.map((value) => (value - mean) ** 2));
    return Math.sqrt(variance);
  }

  private computeSlope(points: Array<{ x: number; y: number }>): number {
    if (points.length < 2) return 0;
    const xMean = avg(points.map((p) => p.x));
    const yMean = avg(points.map((p) => p.y));

    const numerator = points.reduce((sum, p) => sum + (p.x - xMean) * (p.y - yMean), 0);
    const denominator = points.reduce((sum, p) => sum + (p.x - xMean) ** 2, 0);
    if (denominator === 0) return 0;

    return numerator / denominator / 10000000;
  }
}
