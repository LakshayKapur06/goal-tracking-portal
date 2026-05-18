"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleCycleWindow(id: string, newStatus: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.cycleWindow.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath("/admin/cycles");
}
