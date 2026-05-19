"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["ACTIVE", "UPCOMING", "CLOSED"] as const;

export async function toggleCycleWindow(id: string, newStatus: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  if (!VALID_STATUSES.includes(newStatus as typeof VALID_STATUSES[number])) {
    throw new Error("Invalid status value");
  }

  await prisma.cycleWindow.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath("/admin/cycles");
}
