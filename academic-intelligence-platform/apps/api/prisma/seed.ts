import { PrismaClient, AssessmentType, GoalType } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.submission.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();

  const student = await prisma.student.create({
    data: {
      name: "Alex Chen",
      email: "alex.chen@example.edu",
      semesterStart: dayjs().startOf("year").add(8, "month").toDate(),
    },
  });

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        studentId: student.id,
        code: "CS301",
        title: "Algorithms",
        creditHours: 3,
        targetGrade: 85,
        difficultyBase: 1.2,
      },
    }),
    prisma.course.create({
      data: {
        studentId: student.id,
        code: "STAT210",
        title: "Applied Statistics",
        creditHours: 3,
        targetGrade: 88,
        difficultyBase: 1.05,
      },
    }),
    prisma.course.create({
      data: {
        studentId: student.id,
        code: "ECON110",
        title: "Microeconomics",
        creditHours: 3,
        targetGrade: 82,
        difficultyBase: 0.95,
      },
    }),
  ]);

  const [cs, stat, econ] = courses;

  const csAssessments = await Promise.all([
    prisma.assessment.create({
      data: {
        courseId: cs.id,
        name: "Assignment 1",
        type: AssessmentType.ASSIGNMENT,
        weight: 10,
        dueDate: dayjs().subtract(30, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: cs.id,
        name: "Midterm",
        type: AssessmentType.MIDTERM,
        weight: 25,
        dueDate: dayjs().subtract(10, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: cs.id,
        name: "Final",
        type: AssessmentType.FINAL,
        weight: 40,
        dueDate: dayjs().add(35, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: cs.id,
        name: "Project",
        type: AssessmentType.PROJECT,
        weight: 25,
        dueDate: dayjs().add(20, "day").toDate(),
      },
    }),
  ]);

  const statAssessments = await Promise.all([
    prisma.assessment.create({
      data: {
        courseId: stat.id,
        name: "Quiz Set",
        type: AssessmentType.QUIZ,
        weight: 20,
        dueDate: dayjs().subtract(7, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: stat.id,
        name: "Assignment",
        type: AssessmentType.ASSIGNMENT,
        weight: 20,
        dueDate: dayjs().subtract(2, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: stat.id,
        name: "Midterm",
        type: AssessmentType.MIDTERM,
        weight: 25,
        dueDate: dayjs().add(5, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: stat.id,
        name: "Final",
        type: AssessmentType.FINAL,
        weight: 35,
        dueDate: dayjs().add(40, "day").toDate(),
      },
    }),
  ]);

  const econAssessments = await Promise.all([
    prisma.assessment.create({
      data: {
        courseId: econ.id,
        name: "Weekly Quizzes",
        type: AssessmentType.QUIZ,
        weight: 25,
        dueDate: dayjs().subtract(8, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: econ.id,
        name: "Essay",
        type: AssessmentType.ASSIGNMENT,
        weight: 25,
        dueDate: dayjs().add(8, "day").toDate(),
      },
    }),
    prisma.assessment.create({
      data: {
        courseId: econ.id,
        name: "Final",
        type: AssessmentType.FINAL,
        weight: 50,
        dueDate: dayjs().add(30, "day").toDate(),
      },
    }),
  ]);

  await Promise.all([
    prisma.submission.create({
      data: {
        assessmentId: csAssessments[0].id,
        submittedAt: dayjs().subtract(31, "day").toDate(),
        score: 78,
        timeSpentHrs: 8,
      },
    }),
    prisma.submission.create({
      data: {
        assessmentId: csAssessments[1].id,
        submittedAt: dayjs().subtract(11, "day").toDate(),
        score: 72,
        timeSpentHrs: 18,
      },
    }),
    prisma.submission.create({
      data: {
        assessmentId: statAssessments[0].id,
        submittedAt: dayjs().subtract(8, "day").toDate(),
        score: 84,
      },
    }),
    prisma.submission.create({
      data: {
        assessmentId: statAssessments[1].id,
        submittedAt: dayjs().subtract(2, "day").toDate(),
        score: 76,
      },
    }),
    prisma.submission.create({
      data: {
        assessmentId: econAssessments[0].id,
        submittedAt: dayjs().subtract(9, "day").toDate(),
        score: 88,
      },
    }),
  ]);

  const sessionDates = Array.from({ length: 21 }, (_, i) => dayjs().subtract(i, "day"));
  for (const date of sessionDates) {
    await prisma.studySession.createMany({
      data: [
        {
          studentId: student.id,
          courseCode: "CS301",
          date: date.toDate(),
          durationHrs: iif(date.date() % 2 === 0, 1.5, 2.5),
          productivity: iif(date.date() % 5 === 0, 2, 4),
        },
        {
          studentId: student.id,
          courseCode: "STAT210",
          date: date.toDate(),
          durationHrs: iif(date.date() % 3 === 0, 1, 1.8),
          productivity: iif(date.date() % 4 === 0, 3, 4),
        },
      ],
    });
  }

  await prisma.goal.createMany({
    data: [
      {
        studentId: student.id,
        goalType: GoalType.GPA,
        targetValue: 3.7,
        dueDate: dayjs().add(45, "day").toDate(),
      },
      {
        studentId: student.id,
        goalType: GoalType.COURSE_GRADE,
        targetValue: 85,
        dueDate: dayjs().add(45, "day").toDate(),
      },
      {
        studentId: student.id,
        goalType: GoalType.STUDY_HOURS,
        targetValue: 16,
        dueDate: dayjs().add(7, "day").toDate(),
      },
    ],
  });

  console.log(`Seeded student ${student.name}`);
}

function iif(condition: boolean, whenTrue: number, whenFalse: number): number {
  return condition ? whenTrue : whenFalse;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
