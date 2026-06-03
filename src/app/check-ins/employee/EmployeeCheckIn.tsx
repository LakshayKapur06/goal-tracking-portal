"use client";

import { useState } from "react";
import { saveEmployeeCheckIn } from "@/app/actions/checkinActions";
import { computeProgressScore } from "@/lib/utils";
import styles from "../CheckIn.module.css";
import { MessageSquare } from "lucide-react";

export interface CheckIn {
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
  weightage: number;
  checkIns?: CheckIn[];
}

export default function EmployeeCheckIn({ goals }: { goals: Goal[] }) {
  const [activeQuarter, setActiveQuarter] = useState("Q1");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (goals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No Approved Goals</h3>
        <p>You need to have approved goals before you can submit check-ins.</p>
      </div>
    );
  }

  const handleSave = async (goalId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const actual = form.get("actual") as string;
    const status = form.get("status") as string;

    setLoadingId(goalId);
    try {
      await saveEmployeeCheckIn(goalId, activeQuarter, actual, status);
      // For a quick visual update without a full reload, we might normally use React state,
      // but for this hackathon context, reload is safer to sync.
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.quarterSelector}>
        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
          <button 
            key={q}
            className={`${styles.quarterBtn} ${activeQuarter === q ? styles.active : ''}`}
            onClick={() => setActiveQuarter(q)}
          >
            {q} Check-in
          </button>
        ))}
      </div>

      {goals.map(goal => {
        const checkIn = goal.checkIns?.find((c: CheckIn) => c.quarter === activeQuarter) || { quarter: activeQuarter, actualAchievement: "", progressStatus: "NOT_STARTED", managerComment: "" };
        const score = computeProgressScore(goal.uomType, goal.target, checkIn.actualAchievement || "");
        
        return (
          <div key={goal.id} className={styles.goalCard}>
            <div className={styles.goalHeader}>
              <div>
                <h3>{goal.title}</h3>
                <div className={styles.goalDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>UoM</span>
                    <span className={styles.detailValue}>{goal.uomType}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Planned Target</span>
                    <span className={styles.detailValue}>{goal.target}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Weightage</span>
                    <span className={styles.detailValue}>{goal.weightage}%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.3rem' }}>Progress</span>
                <div className={styles.scoreCircle} style={{ borderColor: score >= 100 ? 'var(--success)' : (score > 0 ? 'var(--primary)' : 'var(--surface-border)') }}>
                  {Math.round(score)}%
                </div>
              </div>
            </div>

            <form onSubmit={(e) => handleSave(goal.id, e)} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Actual Achievement</label>
                <input 
                  name="actual"
                  required
                  defaultValue={checkIn.actualAchievement || ""}
                  placeholder={`Your actual ${goal.uomType === 'TIMELINE' ? 'date' : 'number'}`}
                  type={goal.uomType === 'TIMELINE' ? 'date' : 'text'}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Status</label>
                <select name="status" defaultValue={checkIn.progressStatus} required>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ON_TRACK">On Track</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={loadingId === goal.id}>
                {loadingId === goal.id ? "Saving..." : "Save Update"}
              </button>
            </form>

            {checkIn.managerComment && (
              <div className={styles.managerComment}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>
                  <MessageSquare size={14} /> Manager Feedback
                </div>
                <p>{checkIn.managerComment}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
