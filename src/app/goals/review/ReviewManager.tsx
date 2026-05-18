"use client";

import { useState } from "react";
import { approveEmployeeGoals, returnForRework } from "@/app/actions/managerActions";
import styles from "./ReviewManager.module.css";
import { AlertCircle, Check, X } from "lucide-react";

export default function ReviewManager({ employees }: { employees: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Track edits locally per employee
  const [edits, setEdits] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    employees.forEach(emp => {
      initial[emp.id] = emp.goals.map((g: any) => ({
        id: g.id,
        target: g.target,
        weightage: g.weightage.toString()
      }));
    });
    return initial;
  });

  const handleEditChange = (empId: string, goalId: string, field: string, value: string) => {
    setEdits(prev => ({
      ...prev,
      [empId]: prev[empId].map(g => g.id === goalId ? { ...g, [field]: value } : g)
    }));
  };

  const handleApprove = async (empId: string) => {
    const empEdits = edits[empId];
    const totalWeight = empEdits.reduce((sum, g) => sum + parseFloat(g.weightage || "0"), 0);
    
    if (totalWeight !== 100) {
      alert("Total weightage must be exactly 100% before approving.");
      return;
    }

    setLoadingId(empId);
    try {
      await approveEmployeeGoals(empId, empEdits);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
      setLoadingId(null);
    }
  };

  const handleReturn = async (empId: string) => {
    const comment = prompt("Please provide a reason for returning the goals:");
    if (comment === null) return;

    setLoadingId(empId);
    try {
      await returnForRework(empId, comment);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
      setLoadingId(null);
    }
  };

  if (employees.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No Pending Approvals</h3>
        <p>There are currently no goals pending your review.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {employees.map(emp => {
        const empEdits = edits[emp.id] || [];
        const totalWeight = empEdits.reduce((sum, g) => sum + parseFloat(g.weightage || "0"), 0);
        const isValid = totalWeight === 100;

        return (
          <div key={emp.id} className={styles.employeeCard}>
            <div className={styles.employeeHeader}>
              <div>
                <h2>{emp.name}</h2>
                <p>{emp.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Total Weight</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: isValid ? 'var(--success)' : 'var(--danger)' }}>
                  {totalWeight}%
                </div>
              </div>
            </div>

            <table className={styles.goalsTable}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Goal Title</th>
                  <th style={{ width: '20%' }}>UoM</th>
                  <th style={{ width: '20%' }}>Target</th>
                  <th style={{ width: '20%' }}>Weightage (%)</th>
                </tr>
              </thead>
              <tbody>
                {emp.goals.map((goal: any) => {
                  const editState = empEdits.find(e => e.id === goal.id) || { target: goal.target, weightage: goal.weightage };
                  return (
                    <tr key={goal.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{goal.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{goal.thrustArea}</div>
                      </td>
                      <td>{goal.uomType}</td>
                      <td>
                        <input 
                          className={styles.inlineInput} 
                          value={editState.target} 
                          onChange={(e) => handleEditChange(emp.id, goal.id, 'target', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number"
                          className={styles.inlineInput} 
                          value={editState.weightage} 
                          onChange={(e) => handleEditChange(emp.id, goal.id, 'weightage', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.actions}>
              {!isValid ? (
                <div className={styles.weightError}>
                  <AlertCircle size={18} /> Weightage must be 100% to approve
                </div>
              ) : (
                <div style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} /> Valid for approval
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleReturn(emp.id)} 
                  className={styles.btnDanger}
                  disabled={loadingId === emp.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <X size={16} /> Return for Rework
                </button>
                <button 
                  onClick={() => handleApprove(emp.id)} 
                  className={styles.btnPrimary}
                  disabled={!isValid || loadingId === emp.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Check size={16} /> Approve Goals
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
