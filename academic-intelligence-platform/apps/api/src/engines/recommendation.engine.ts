import { CourseAnalytics, Recommendation, SemesterProjection } from "../types/analytics.js";

export class RecommendationEngine {
  generate(courseAnalytics: CourseAnalytics[], semesterProjection: SemesterProjection): Recommendation[] {
    const output: Recommendation[] = [];

    for (const course of courseAnalytics) {
      if (course.riskScore >= 70) {
        output.push({
          id: `risk-${course.courseCode}`,
          severity: "high",
          category: "risk",
          courseCode: course.courseCode,
          message: `${course.courseCode}: You are underperforming in heavily weighted assessments; risk score is ${course.riskScore}%.`,
          metric: course.riskScore,
        });
      }

      if (course.requiredAverageForTarget !== null && course.requiredAverageForTarget > 88) {
        output.push({
          id: `target-${course.courseCode}`,
          severity: "medium",
          category: "grade",
          courseCode: course.courseCode,
          message: `To achieve your target in ${course.courseCode}, you need an average of ${course.requiredAverageForTarget}% on remaining coursework.`,
          metric: course.requiredAverageForTarget,
        });
      }

      if (course.completionRate < 60) {
        output.push({
          id: `momentum-${course.courseCode}`,
          severity: "medium",
          category: "momentum",
          courseCode: course.courseCode,
          message: `${course.courseCode}: Assessment completion rate is ${course.completionRate}%; priority recovery is recommended this week.`,
          metric: course.completionRate,
        });
      }

      if (course.burnoutRisk >= 75) {
        output.push({
          id: `burnout-${course.courseCode}`,
          severity: "high",
          category: "burnout",
          courseCode: course.courseCode,
          message: `${course.courseCode}: Burnout indicator is elevated at ${course.burnoutRisk}%; rebalance workload and reduce deep-work block size.`,
          metric: course.burnoutRisk,
        });
      }
    }

    const topImpact = [...courseAnalytics].sort((a, b) => b.gpaImpactScore - a.gpaImpactScore)[0];
    if (topImpact) {
      output.push({
        id: `impact-${topImpact.courseCode}`,
        severity: "low",
        category: "planning",
        courseCode: topImpact.courseCode,
        message: `Focus on ${topImpact.courseCode} first; it currently has the highest GPA impact score (${topImpact.gpaImpactScore}%).`,
        metric: topImpact.gpaImpactScore,
      });
    }

    if (semesterProjection.targetGpa !== null && semesterProjection.projectedGpa < semesterProjection.targetGpa) {
      output.push({
        id: "gpa-gap",
        severity: "high",
        category: "goal",
        message: `Projected GPA is ${semesterProjection.projectedGpa}, below your target of ${semesterProjection.targetGpa}. Increase high-impact course performance this cycle.`,
        metric: semesterProjection.projectedGpa,
      });
    }

    return output
      .sort((a, b) => this.severityOrder(b.severity) - this.severityOrder(a.severity) || b.metric - a.metric)
      .slice(0, 12);
  }

  private severityOrder(severity: Recommendation["severity"]): number {
    if (severity === "high") return 3;
    if (severity === "medium") return 2;
    return 1;
  }
}
