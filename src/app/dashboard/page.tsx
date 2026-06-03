import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import styles from "./Dashboard.module.css";
import Link from "next/link";
import { Target, Users, CheckCircle, Activity, ShieldAlert } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { id: userId, role, name } = session.user;

  const stats = {
    totalGoals: 0,
    pendingGoals: 0,
    completedGoals: 0,
    teamSize: 0,
  };

  if (role === "EMPLOYEE") {
    const [totalGoals, pendingGoals, completedGoals] = await Promise.all([
      prisma.goal.count({ where: { employeeId: userId } }),
      prisma.goal.count({ where: { employeeId: userId, status: "PENDING_APPROVAL" } }),
      prisma.goal.count({ where: { employeeId: userId, status: "LOCKED" } }),
    ]);
    stats.totalGoals = totalGoals;
    stats.pendingGoals = pendingGoals;
    stats.completedGoals = completedGoals;
  } else if (role === "MANAGER") {
    const team = await prisma.user.findMany({ where: { managerId: userId }, select: { id: true } });
    const teamIds = team.map(t => t.id);
    stats.teamSize = teamIds.length;
    const [totalGoals, pendingGoals] = await Promise.all([
      prisma.goal.count({ where: { employeeId: { in: teamIds } } }),
      prisma.goal.count({ where: { employeeId: { in: teamIds }, status: "PENDING_APPROVAL" } }),
    ]);
    stats.totalGoals = totalGoals;
    stats.pendingGoals = pendingGoals;
  } else if (role === "ADMIN") {
    const [teamSize, totalGoals, pendingGoals] = await Promise.all([
      prisma.user.count({ where: { role: "EMPLOYEE" } }),
      prisma.goal.count(),
      prisma.goal.count({ where: { status: "PENDING_APPROVAL" } }),
    ]);
    stats.teamSize = teamSize;
    stats.totalGoals = totalGoals;
    stats.pendingGoals = pendingGoals;
  }

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <div className={styles.header}>
        <h1>Welcome, {name?.split(' ')[0]}</h1>
        <p>Here is your overview for the current cycle.</p>
      </div>

      <div className={styles.statsGrid}>
        {role === "EMPLOYEE" && (
          <>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><Target size={18} /> Total Goals</div>
              <div className={styles.statValue}>{stats.totalGoals}</div>
              <div className={styles.statDesc}>Your created goals</div>
            </div>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><Activity size={18} color="var(--warning)" /> Pending Approval</div>
              <div className={styles.statValue} style={{ color: 'var(--warning)' }}>{stats.pendingGoals}</div>
              <div className={styles.statDesc}>Awaiting manager review</div>
            </div>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><CheckCircle size={18} color="var(--success)" /> Approved Goals</div>
              <div className={styles.statValue} style={{ color: 'var(--success)' }}>{stats.completedGoals}</div>
              <div className={styles.statDesc}>Locked and ready for tracking</div>
            </div>
          </>
        )}

        {(role === "MANAGER" || role === "ADMIN") && (
          <>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><Users size={18} /> {role === 'ADMIN' ? 'Total Employees' : 'Team Size'}</div>
              <div className={styles.statValue}>{stats.teamSize}</div>
              <div className={styles.statDesc}>Direct reports</div>
            </div>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><Target size={18} /> Total Team Goals</div>
              <div className={styles.statValue}>{stats.totalGoals}</div>
              <div className={styles.statDesc}>Across all employees</div>
            </div>
            <div className={`glass ${styles.statCard}`}>
              <div className={styles.statTitle}><ShieldAlert size={18} color="var(--warning)" /> Pending Approvals</div>
              <div className={styles.statValue} style={{ color: 'var(--warning)' }}>{stats.pendingGoals}</div>
              <div className={styles.statDesc}>Require your action</div>
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          {role === "EMPLOYEE" && (
            <>
              <div className={styles.actionCard}>
                <h3>Create Goals</h3>
                <p>Define your objectives, set weightages, and align them with organizational thrust areas.</p>
                <Link href="/goals/create" className={styles.btn}>Start Goal Setting</Link>
              </div>
              <div className={styles.actionCard}>
                <h3>Log Achievements</h3>
                <p>Submit your quarterly progress and update the status of your approved goals.</p>
                <Link href="/check-ins/employee" className={styles.btnOutline}>Update Check-in</Link>
              </div>
            </>
          )}

          {role === "MANAGER" && (
            <>
              <div className={styles.actionCard}>
                <h3>Review Team Goals</h3>
                <p>Review, modify, or approve goals submitted by your team members.</p>
                <Link href="/goals/review" className={styles.btn}>Review Goals</Link>
              </div>
              <div className={styles.actionCard}>
                <h3>Quarterly Check-ins</h3>
                <p>Review employee progress, compare planned vs actuals, and provide structured feedback.</p>
                <Link href="/check-ins/manager" className={styles.btnOutline}>Conduct Check-ins</Link>
              </div>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <div className={styles.actionCard}>
                <h3>Analytics & Reports</h3>
                <p>View organizational goal completion trends and download full achievement reports.</p>
                <Link href="/admin/analytics" className={styles.btn}>View Analytics</Link>
              </div>
              <div className={styles.actionCard}>
                <h3>Manage Cycles</h3>
                <p>Open or close quarterly check-in windows and trigger escalations for delays.</p>
                <Link href="/admin/cycles" className={styles.btnOutline}>Manage Schedule</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
