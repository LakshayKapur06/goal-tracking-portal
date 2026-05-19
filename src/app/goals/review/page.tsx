import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewManager from "./ReviewManager";

export default async function ManagerReviewPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "MANAGER") redirect("/dashboard");

  // Get employees reporting to this manager
  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    select: { id: true, name: true, email: true }
  });

  const teamIds = team.map(t => t.id);

  // Get all PENDING goals for these employees
  const pendingGoals = await prisma.goal.findMany({
    where: { employeeId: { in: teamIds }, status: "PENDING_APPROVAL" },
    orderBy: { createdAt: 'asc' }
  });

  // Group goals by employee
  const employeesWithPending = team.filter(emp => 
    pendingGoals.some(g => g.employeeId === emp.id)
  ).map(emp => ({
    ...emp,
    goals: pendingGoals.filter(g => g.employeeId === emp.id)
  }));

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Team Goals Review</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Review, edit, and approve goals submitted by your team members.</p>
      </div>

      <ReviewManager employees={employeesWithPending} />
    </div>
  );
}
