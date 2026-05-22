import { prisma } from "../config/db.js";

export class StudentRepository {
  async findStudentWithAcademicData(studentId: string) {
    return prisma.student.findUnique({
      where: { id: studentId },
      include: {
        goals: true,
        studySessions: true,
        courses: {
          include: {
            assessments: {
              include: {
                submissions: true,
              },
            },
          },
        },
      },
    });
  }

  async findFirstStudentId() {
    const student = await prisma.student.findFirst({ select: { id: true } });
    return student?.id ?? null;
  }
}
