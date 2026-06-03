"use client";

import { useState } from "react";
import { saveManagerComment } from "@/app/actions/checkinActions";
import { computeProgressScore } from "@/lib/utils";
import styles from "../CheckIn.module.css";
import { MessageSquare } from "lucide-react";

export interface CheckIn {
  id: string;
  quarter: string;
  actualAchievement?: string | null;
  progressStatus: string;
  managerComment?: string | null;
}

export interface Goal {
  id: string;
  title: string;
  uomType: string;
  target: string;
  checkIns?: CheckIn[];
}

export interface Employee {
  id: string;
  name: string | null;
  goals: Goal[];
}

export default function ManagerCheckIn({ employees }: { employees: Employee[] }) {
  const [activeQuarter, setActiveQuarter] = useState("Q1");
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees.length > 0 ? employees[0].id : "");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (employees.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No Approved Goals</h3>
        <p>No team members have approved goals ready for check-ins.</p>
      </div>
    );
  }

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  const handleSaveComment = async (checkInId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const comment = new FormData(e.currentTarget).get("comment") as string;
    
    setLoadingId(checkInId);
    try {
      await saveManagerComment(checkInId, comment);
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Team Members</h3>
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmpId(emp.id)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                background: selectedEmpId === emp.id ? 'var(--surface)' : 'transparent',
                border: `1px solid ${selectedEmpId === emp.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ fontWeight: 500 }}>{emp.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{emp.goals.length} Goals</div>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className={styles.quarterSelector} style={{ marginBottom: 0 }}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <button 
                key={q}
                className={`${styles.quarterBtn} ${activeQuarter === q ? styles.active : ''}`}
                onClick={() => setActiveQuarter(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {selectedEmp?.goals.map((goal: Goal) => {
            const checkIn = goal.checkIns?.find((c: CheckIn) => c.quarter === activeQuarter);
            const score = checkIn ? computeProgressScore(goal.uomType, goal.target, checkIn.actualAchievement || "") : 0;
            
            return (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div>
                    <h3>{goal.title}</h3>
                    <div className={styles.goalDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Planned Target</span>
                        <span className={styles.detailValue}>{goal.target} {goal.uomType}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Actual Achievement</span>
                        <span className={styles.detailValue} style={{ color: checkIn ? 'var(--foreground)' : 'rgba(255,255,255,0.3)' }}>
                          {checkIn ? checkIn.actualAchievement : 'No update yet'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Status</span>
                        <span className={styles.detailValue} style={{ color: checkIn?.progressStatus === 'COMPLETED' ? 'var(--success)' : 'var(--warning)' }}>
                          {checkIn ? checkIn.progressStatus.replace('_', ' ') : 'NOT STARTED'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>Score</span>
                    <div className={styles.scoreCircle} style={{ borderColor: score >= 100 ? 'var(--success)' : (score > 0 ? 'var(--primary)' : 'var(--surface-border)') }}>
                      {Math.round(score)}%
                    </div>
                  </div>
                </div>

                {checkIn ? (
                  <form onSubmit={(e) => handleSaveComment(checkIn.id, e)} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '1.5rem' }}>
                    <div style={{ flex: 1 }} className={styles.inputGroup}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={16} /> Structured Feedback</label>
                      <textarea 
                        name="comment"
                        defaultValue={checkIn.managerComment || ""}
                        placeholder="Add your review comments here..."
                        rows={2}
                        required
                      />
                    </div>
                    <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-end', padding: '0.85rem 1.5rem' }} disabled={loadingId === checkIn.id}>
                      {loadingId === checkIn.id ? 'Saving...' : 'Save Comment'}
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    Employee has not submitted a check-in for this quarter.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
