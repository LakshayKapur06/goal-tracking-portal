import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ManagerCheckIn from "./ManagerCheckIn";

export default async function ManagerCheckInPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "MANAGER") redirect("/dashboard");

  // Get employees with locked goals and check-ins in a single query
  const teamWithGoals = await prisma.user.findMany({
    where: { managerId: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      goals: {
        where: { status: "LOCKED" },
        include: { checkIns: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  const employeesWithGoals = teamWithGoals.filter(emp => emp.goals.length > 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Team Check-ins</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Review progress, compare planned vs actuals, and provide structured feedback.</p>
      </div>

      <ManagerCheckIn employees={employeesWithGoals} />
    </div>
  );
}
