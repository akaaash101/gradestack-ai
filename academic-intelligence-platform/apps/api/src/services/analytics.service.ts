import { AcademicAnalyticsEngine } from "../engines/academic-analytics.engine.js";
import { RecommendationEngine } from "../engines/recommendation.engine.js";
import { StudyPlannerEngine } from "../engines/study-planner.engine.js";
import { StudentRepository } from "../repositories/student.repository.js";
import { DashboardPayload } from "../types/analytics.js";

export class AnalyticsService {
  constructor(
    private readonly studentRepository = new StudentRepository(),
    private readonly analyticsEngine = new AcademicAnalyticsEngine(),
    private readonly recommendationEngine = new RecommendationEngine(),
    private readonly plannerEngine = new StudyPlannerEngine()
  ) {}

  async getDashboard(studentId?: string): Promise<DashboardPayload> {
    const resolvedStudentId = studentId ?? (await this.studentRepository.findFirstStudentId());

    if (!resolvedStudentId) {
      throw new Error("No student found in database. Seed data first.");
    }

    const student = await this.studentRepository.findStudentWithAcademicData(resolvedStudentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const courseAnalytics = this.analyticsEngine.buildCourseAnalytics(student);
    const gpaCurrent = this.analyticsEngine.buildCurrentGpa(courseAnalytics);
    const gpaTrend = this.analyticsEngine.buildGpaTrend(student, courseAnalytics);
    const velocity = this.analyticsEngine.buildVelocity(student);
    const semesterProjection = this.analyticsEngine.buildSemesterProjection(student, courseAnalytics);
    const recommendations = this.recommendationEngine.generate(courseAnalytics, semesterProjection);
    const studyPlan = this.plannerEngine.buildWeeklyPlan(courseAnalytics);

    return {
      studentId: student.id,
      studentName: student.name,
      gpaCurrent,
      gpaTrend,
      courseAnalytics,
      recommendations,
      studyPlan,
      velocity,
      semesterProjection,
    };
  }
}
