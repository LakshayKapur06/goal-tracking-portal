import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const totalEmployees = await prisma.user.count({ where: { role: "EMPLOYEE" } });
  const totalGoals = await prisma.goal.count();
  const draftGoals = await prisma.goal.count({ where: { status: "DRAFT" } });
  const pendingGoals = await prisma.goal.count({ where: { status: "PENDING_APPROVAL" } });
  const lockedGoals = await prisma.goal.count({ where: { status: "LOCKED" } });

  // Get Thrust Area distribution
  const goals = await prisma.goal.findMany({ select: { thrustArea: true } });
  const thrustAreaDistribution = goals.reduce((acc: any, goal) => {
    acc[goal.thrustArea] = (acc[goal.thrustArea] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    totalEmployees,
    totalGoals,
    draftGoals,
    pendingGoals,
    lockedGoals,
    thrustAreaDistribution
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Organization Analytics</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Overview of goal adoption and progress across the organization.</p>
      </div>

      <AnalyticsClient stats={stats} />
    </div>
  );
}
