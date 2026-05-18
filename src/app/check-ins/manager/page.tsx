import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ManagerCheckIn from "./ManagerCheckIn";

export default async function ManagerCheckInPage() {
  const session = await auth();
  if (!session || session.user.role !== "MANAGER") return null;

  // Get employees reporting to this manager
  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    select: { id: true, name: true, email: true }
  });

  const teamIds = team.map(t => t.id);

  // Get locked goals for these employees with check-ins
  const goals = await prisma.goal.findMany({
    where: { employeeId: { in: teamIds }, status: "LOCKED" },
    include: { checkIns: true },
    orderBy: { createdAt: 'asc' }
  });

  // Attach goals to employees
  const employeesWithGoals = team.map(emp => ({
    ...emp,
    goals: goals.filter(g => g.employeeId === emp.id)
  })).filter(emp => emp.goals.length > 0);

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
