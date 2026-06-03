"use client";

import { useState } from "react";
import { toggleCycleWindow } from "@/app/actions/adminActions";

export interface Cycle {
  id: string;
  phase: string;
  status: string;
  updatedAt: Date | string;
}

export default function CycleManager({ cycles }: { cycles: Cycle[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const newStatus = currentStatus === "ACTIVE" ? "CLOSED" : "ACTIVE";
    try {
      await toggleCycleWindow(id, newStatus);
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {cycles.map((c) => (
        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{c.phase}</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Last updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              color: c.status === 'ACTIVE' ? 'var(--success)' : (c.status === 'CLOSED' ? 'var(--danger)' : 'var(--warning)'), 
              background: c.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : (c.status === 'CLOSED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'), 
              padding: '0.3rem 0.8rem', 
              borderRadius: '1rem' 
            }}>
              {c.status}
            </span>
            <button 
              disabled={loadingId === c.id}
              onClick={() => handleToggle(c.id, c.status)}
              style={{ 
                background: c.status === 'ACTIVE' ? 'transparent' : 'var(--primary)', 
                color: c.status === 'ACTIVE' ? 'var(--danger)' : 'white', 
                border: c.status === 'ACTIVE' ? '1px solid rgba(239,68,68,0.3)' : 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                cursor: 'pointer',
                opacity: loadingId === c.id ? 0.5 : 1
              }}
            >
              {loadingId === c.id ? 'Saving...' : c.status === 'ACTIVE' ? 'Close Window' : 'Open Window'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
