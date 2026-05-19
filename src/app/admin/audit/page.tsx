import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AuditLogPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: { user: true, goal: { include: { employee: true } } },
    take: 100 // Limit to last 100 for performance
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Audit Trail</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Review system changes and goal modifications.</p>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Date & Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>User</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Action</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Target Entity</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No audit logs found.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{log.user.name} <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>({log.user.role})</span></td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {log.targetEntity} {log.goal && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{log.goal.title} (Owner: {log.goal.employee.name})</div>}
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '300px', overflowX: 'auto' }}>
                    <pre style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', margin: 0 }}>
                      {log.changes}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
