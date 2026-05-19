import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Sanitize cell values to prevent CSV injection attacks
function sanitizeCSV(val: string): string {
  if (!val) return '""';
  // Escape embedded double quotes
  const escaped = val.replace(/"/g, '""');
  // Strip leading formula characters that could trigger code execution in Excel
  const safe = escaped.replace(/^[=+\-@\t\r]/g, "'");
  return `"${safe}"`;
}

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
      sanitizeCSV(goal.employee.name || ""),
      sanitizeCSV(goal.employee.email || ""),
      sanitizeCSV(goal.title),
      sanitizeCSV(goal.thrustArea),
      sanitizeCSV(goal.uomType),
      sanitizeCSV(goal.target),
      goal.weightage,
      sanitizeCSV(goal.status),
      sanitizeCSV(q1),
      sanitizeCSV(q2),
      sanitizeCSV(q3),
      sanitizeCSV(q4)
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
