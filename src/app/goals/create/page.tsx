import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GoalManager from "./GoalManager";

export default async function GoalsCreatePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "EMPLOYEE") redirect("/dashboard");

  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: 'asc' }
  });

  const isSubmitted = goals.some(g => g.status !== "DRAFT");

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Goal Setting</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Define your objectives for the current cycle. Total weightage must equal 100%.</p>
      </div>

      <GoalManager initialGoals={goals} isSubmitted={isSubmitted} />
    </div>
  );
}
