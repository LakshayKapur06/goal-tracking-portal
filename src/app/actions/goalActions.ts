"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface GoalInput {
  id?: string;
  title: string;
  description?: string;
  thrustArea: string;
  uomType: string;
  target: string;
  weightage: string | number;
}

export async function saveGoal(data: GoalInput) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const { id, title, description, thrustArea, uomType, target, weightage } = data;

  if (id) {
    // Update existing
    await prisma.goal.update({
      where: { id, employeeId: session.user.id, status: "DRAFT" },
      data: { title, description, thrustArea, uomType, target, weightage: typeof weightage === 'string' ? parseFloat(weightage) : weightage }
    });
  } else {
    // Check max goals limit
    const count = await prisma.goal.count({ where: { employeeId: session.user.id } });
    if (count >= 8) throw new Error("Maximum 8 goals allowed");

    await prisma.goal.create({
      data: {
        employeeId: session.user.id,
        title,
        description,
        thrustArea,
        uomType,
        target,
        weightage: typeof weightage === 'string' ? parseFloat(weightage) : weightage,
        status: "DRAFT"
      }
    });
  }
  
  revalidatePath("/goals/create");
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  await prisma.goal.delete({
    where: { id, employeeId: session.user.id, status: "DRAFT" }
  });

  revalidatePath("/goals/create");
}

export async function submitGoalsForApproval() {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id, status: "DRAFT" }
  });

  if (goals.length === 0) throw new Error("No goals to submit");
  if (goals.length > 8) throw new Error("Maximum 8 goals allowed");

  let totalWeight = 0;
  for (const g of goals) {
    if (g.weightage < 10) throw new Error(`Goal "${g.title}" has less than 10% weightage`);
    totalWeight += g.weightage;
  }

  if (Math.abs(totalWeight - 100) > 0.01) throw new Error(`Total weightage must be exactly 100%. Current: ${totalWeight}%`);

  await prisma.goal.updateMany({
    where: { employeeId: session.user.id, status: "DRAFT" },
    data: { status: "PENDING_APPROVAL" }
  });

  // Here we would trigger the Teams/Email notification to the Manager
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { manager: true } });
  if (user?.manager) {
    await prisma.notificationLog.create({
      data: {
        userId: user.manager.id,
        type: "EMAIL",
        message: `Employee ${user.name} has submitted their goals for approval.`,
        status: "PENDING"
      }
    });
  }

  revalidatePath("/goals/create");
}
