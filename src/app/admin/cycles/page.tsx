import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CycleManager from "./CycleManager";

export default async function ManageCyclesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const cycles = await prisma.cycleWindow.findMany({
    orderBy: { phase: 'asc' }
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manage Performance Cycles</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Control when employees can set goals and enter check-ins.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Current Active Cycle: <span style={{ color: 'var(--primary)' }}>FY 2026-27</span></h2>
        
        <CycleManager cycles={cycles} />
      </div>
    </div>
  );
}
