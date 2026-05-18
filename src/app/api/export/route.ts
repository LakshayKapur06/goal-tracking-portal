import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    include: {
      employee: { select: { name: true, email: true } },
      checkIns: true
    }
  });

  let csvContent = "Employee Name,Email,Goal Title,Thrust Area,UoM,Planned Target,Weightage (%),Status,Q1 Achievement,Q2 Achievement,Q3 Achievement,Q4 Achievement\n";

  for (const goal of goals) {
    const q1 = goal.checkIns.find(c => c.quarter === 'Q1')?.actualAchievement || "";
    const q2 = goal.checkIns.find(c => c.quarter === 'Q2')?.actualAchievement || "";
    const q3 = goal.checkIns.find(c => c.quarter === 'Q3')?.actualAchievement || "";
    const q4 = goal.checkIns.find(c => c.quarter === 'Q4')?.actualAchievement || "";

    const row = [
      `"${goal.employee.name}"`,
      `"${goal.employee.email}"`,
      `"${goal.title}"`,
      `"${goal.thrustArea}"`,
      `"${goal.uomType}"`,
      `"${goal.target}"`,
      goal.weightage,
      `"${goal.status}"`,
      `"${q1}"`,
      `"${q2}"`,
      `"${q3}"`,
      `"${q4}"`
    ].join(",");

    csvContent += row + "\n";
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=achievement_report.csv"
    }
  });
}
