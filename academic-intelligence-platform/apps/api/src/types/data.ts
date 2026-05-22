import { Prisma } from "@prisma/client";

export type StudentAcademicData = Prisma.StudentGetPayload<{
  include: {
    goals: true;
    studySessions: true;
    courses: {
      include: {
        assessments: {
          include: {
            submissions: true;
          };
        };
      };
    };
  };
}>;
