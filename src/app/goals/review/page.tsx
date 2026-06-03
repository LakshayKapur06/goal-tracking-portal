import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewManager from "./ReviewManager";

export default async function ManagerReviewPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "MANAGER") redirect("/dashboard");

  // Get employees with pending goals in a single query
  const teamWithGoals = await prisma.user.findMany({
    where: { managerId: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      goals: {
        where: { status: "PENDING_APPROVAL" },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  const employeesWithPending = teamWithGoals.filter(emp => emp.goals.length > 0);

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
