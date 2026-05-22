export type CourseAnalytics = {
  courseId: string;
  courseCode: string;
  title: string;
  currentWeightedGrade: number;
  projectedFinalGrade: number;
  difficultyScore: number;
  riskScore: number;
  burnoutRisk: number;
  completionRate: number;
  gpaImpactScore: number;
  requiredAverageForTarget: number | null;
  remainingWeight: number;
  studyHoursLast7Days: number;
  recommendedStudyHoursNext7Days: number;
};

export type TrendPoint = {
  date: string;
  movingAverage: number;
  productivity: number;
  studyHours: number;
};

export type VelocityPoint = {
  week: string;
  completedWeight: number;
  completionRate: number;
};

export type SemesterProjection = {
  projectedGpa: number;
  targetGpa: number | null;
  confidence: number;
  projectedCompletion: number;
};

export type Recommendation = {
  id: string;
  severity: "low" | "medium" | "high";
  category: "grade" | "momentum" | "planning" | "risk" | "goal" | "burnout";
  courseCode?: string;
  message: string;
  metric: number;
};

export type StudyTask = {
  courseCode: string;
  title: string;
  priorityScore: number;
  deadlineUrgency: number;
  estimatedHours: number;
};

export type StudyPlanDay = {
  date: string;
  totalHours: number;
  tasks: StudyTask[];
};

export type DashboardPayload = {
  studentId: string;
  studentName: string;
  gpaCurrent: number;
  gpaTrend: TrendPoint[];
  courseAnalytics: CourseAnalytics[];
  recommendations: Recommendation[];
  studyPlan: StudyPlanDay[];
  velocity: VelocityPoint[];
  semesterProjection: SemesterProjection;
};
