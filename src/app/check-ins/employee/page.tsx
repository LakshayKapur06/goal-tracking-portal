import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EmployeeCheckIn from "./EmployeeCheckIn";

export default async function EmployeeCheckInPage() {
  const session = await auth();
  if (!session || session.user.role !== "EMPLOYEE") return null;

  // Fetch approved goals
  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.id, status: "LOCKED" },
    include: { checkIns: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quarterly Check-ins</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Update your actual achievements against your planned targets.</p>
      </div>

      <EmployeeCheckIn goals={goals} />
    </div>
  );
}
