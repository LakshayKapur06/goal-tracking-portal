"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function approveEmployeeGoals(employeeId: string, edits: any[]) {
  const session = await auth();
  if (!session || session.user.role !== "MANAGER") throw new Error("Unauthorized");

  // Verify the employee reports to this manager
  const employee = await prisma.user.findFirst({
    where: { id: employeeId, managerId: session.user.id }
  });

  if (!employee) throw new Error("Employee not found or unauthorized");

  const goals = await prisma.goal.findMany({
    where: { employeeId, status: "PENDING_APPROVAL" }
  });

  if (goals.length === 0) throw new Error("No pending goals found");

  // Apply edits if any
  for (const edit of edits) {
    const originalGoal = goals.find(g => g.id === edit.id);
    if (!originalGoal) continue;

    const changes: any = {};
    if (originalGoal.target !== edit.target) changes.target = { old: originalGoal.target, new: edit.target };
    if (originalGoal.weightage !== parseFloat(edit.weightage)) changes.weightage = { old: originalGoal.weightage, new: parseFloat(edit.weightage) };

    if (Object.keys(changes).length > 0) {
      // Update goal
      await prisma.goal.update({
        where: { id: edit.id },
        data: { target: edit.target, weightage: parseFloat(edit.weightage) }
      });

      // Log in audit trail
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "INLINE_EDIT",
          targetEntity: "Goal",
          targetId: edit.id,
          goalId: edit.id,
          changes: JSON.stringify(changes)
        }
      });
    }
  }

  // Double check weightage after edits
  const finalGoals = await prisma.goal.findMany({
    where: { employeeId, status: "PENDING_APPROVAL" }
  });
  
  const totalWeight = finalGoals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeight !== 100) {
    throw new Error(`Total weightage must be 100%. After edits, it is ${totalWeight}%`);
  }

  // Lock the goals
  await prisma.goal.updateMany({
    where: { employeeId, status: "PENDING_APPROVAL" },
    data: { status: "LOCKED" }
  });

  // Notify Employee
  await prisma.notificationLog.create({
    data: {
      userId: employeeId,
      type: "EMAIL",
      message: `Your manager has approved and locked your goals.`,
      status: "PENDING"
    }
  });

  revalidatePath("/goals/review");
}

export async function returnForRework(employeeId: string, comment: string) {
  const session = await auth();
  if (!session || session.user.role !== "MANAGER") throw new Error("Unauthorized");

  // Verify
  const employee = await prisma.user.findFirst({
    where: { id: employeeId, managerId: session.user.id }
  });

  if (!employee) throw new Error("Employee not found");

  await prisma.goal.updateMany({
    where: { employeeId, status: "PENDING_APPROVAL" },
    data: { status: "DRAFT" }
  });

  // Notify Employee
  await prisma.notificationLog.create({
    data: {
      userId: employeeId,
      type: "EMAIL",
      message: `Your goals have been returned for rework. Manager comment: ${comment}`,
      status: "PENDING"
    }
  });

  revalidatePath("/goals/review");
}
