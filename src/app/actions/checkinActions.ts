"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveEmployeeCheckIn(goalId: string, quarter: string, actualAchievement: string, progressStatus: string) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  // Verify goal belongs to employee and is locked
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, employeeId: session.user.id, status: "LOCKED" }
  });

  if (!goal) throw new Error("Goal not found or not approved yet.");

  await prisma.checkIn.upsert({
    where: {
      goalId_quarter: { goalId, quarter }
    },
    update: {
      actualAchievement,
      progressStatus
    },
    create: {
      goalId,
      quarter,
      actualAchievement,
      progressStatus
    }
  });

  revalidatePath("/check-ins/employee");
}

export async function saveManagerComment(checkInId: string, managerComment: string) {
  const session = await auth();
  if (!session || session.user.role !== "MANAGER") throw new Error("Unauthorized");

  const checkIn = await prisma.checkIn.findUnique({
    where: { id: checkInId },
    include: { goal: { include: { employee: true } } }
  });

  if (!checkIn || checkIn.goal.employee.managerId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.checkIn.update({
    where: { id: checkInId },
    data: { managerComment }
  });

  revalidatePath("/check-ins/manager");
}
