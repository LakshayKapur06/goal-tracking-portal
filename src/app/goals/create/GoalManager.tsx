"use client";

import { useState } from "react";
import { saveGoal, deleteGoal, submitGoalsForApproval } from "@/app/actions/goalActions";
import styles from "./GoalManager.module.css";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";

export default function GoalManager({ initialGoals, isSubmitted }: { initialGoals: any[], isSubmitted: boolean }) {
  const [goals, setGoals] = useState(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrustArea: "",
    uomType: "MIN",
    target: "",
    weightage: ""
  });

  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      thrustArea: goal.thrustArea,
      uomType: goal.uomType,
      target: goal.target,
      weightage: goal.weightage.toString()
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: "", description: "", thrustArea: "", uomType: "MIN", target: "", weightage: "" });
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const weightNum = parseFloat(formData.weightage);
    if (weightNum < 10) {
      setError("Minimum weightage for a goal is 10%.");
      setLoading(false);
      return;
    }

    const currentOtherWeight = editingId 
      ? goals.filter(g => g.id !== editingId).reduce((sum, g) => sum + g.weightage, 0)
      : totalWeight;

    if (currentOtherWeight + weightNum > 100) {
      setError(`Total weightage cannot exceed 100%. You can only add up to ${100 - currentOtherWeight}%.`);
      setLoading(false);
      return;
    }

    try {
      await saveGoal({ id: editingId, ...formData });
      window.location.reload(); // Quick way to sync server state for hackathon
    } catch (err: any) {
      setError(err.message || "Failed to save goal.");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    setLoading(true);
    try {
      await deleteGoal(id);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (totalWeight !== 100) {
      setError("Total weightage must be exactly 100% to submit.");
      return;
    }
    setLoading(true);
    try {
      await submitGoalsForApproval();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.statusBar} style={{ borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
          <div>
            <h3 style={{ color: 'var(--success)' }}>Goals Submitted</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Your goals are currently locked and under review by your manager.</p>
          </div>
        </div>
        <div className={styles.goalsList}>
          {goals.map(goal => (
            <div key={goal.id} className={styles.goalCard}>
              <div className={styles.goalInfo}>
                <h3>{goal.title}</h3>
                <p>{goal.thrustArea} • {goal.uomType}</p>
              </div>
              <div className={styles.goalMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Target</span>
                  <span className={styles.metaValue} style={{ color: 'var(--foreground)' }}>{goal.target}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Weightage</span>
                  <span className={styles.metaValue}>{goal.weightage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}><AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/> {error}</div>}

      <div className={styles.statusBar}>
        <div>
          <h3>Goal Progress</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{goals.length}/8 goals created</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 600, color: totalWeight === 100 ? 'var(--success)' : 'var(--primary)' }}>{totalWeight}%</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginLeft: '0.3rem' }}>/ 100%</span>
          </div>
          <div className={styles.weightProgressBar}>
            <div 
              className={styles.weightProgressFill} 
              style={{ 
                width: `${Math.min(totalWeight, 100)}%`, 
                background: totalWeight === 100 ? 'var(--success)' : (totalWeight > 100 ? 'var(--danger)' : 'var(--primary)')
              }}
            ></div>
          </div>
        </div>
        <button 
          className={styles.btnPrimary} 
          disabled={totalWeight !== 100 || goals.length === 0 || loading}
          onClick={handleSubmit}
        >
          Submit for Approval
        </button>
      </div>

      {!isAdding && goals.length < 8 && totalWeight < 100 && (
        <button className={styles.btnOutline} onClick={() => setIsAdding(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem', borderStyle: 'dashed' }}>
          <Plus size={20} /> Add New Goal
        </button>
      )}

      {isAdding && (
        <form onSubmit={handleSave} className={`animate-fade-in ${styles.formContainer}`}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? "Edit Goal" : "Create New Goal"}</h3>
          
          <div className={styles.formGrid}>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Goal Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="E.g., Increase Q3 Sales Revenue" />
            </div>
            
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Description (Optional)</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
            </div>

            <div className={styles.inputGroup}>
              <label>Thrust Area</label>
              <select required value={formData.thrustArea} onChange={e => setFormData({...formData, thrustArea: e.target.value})}>
                <option value="" disabled>Select Area</option>
                <option value="Financial">Financial</option>
                <option value="Customer">Customer</option>
                <option value="Internal Process">Internal Process</option>
                <option value="Learning & Growth">Learning & Growth</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Unit of Measurement (UoM)</label>
              <select required value={formData.uomType} onChange={e => setFormData({...formData, uomType: e.target.value})}>
                <option value="MIN">Min (Higher is better)</option>
                <option value="MAX">Max (Lower is better)</option>
                <option value="TIMELINE">Timeline (Date-based)</option>
                <option value="ZERO">Zero-based (e.g., 0 incidents)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Target</label>
              <input required type={formData.uomType === 'TIMELINE' ? 'date' : 'text'} value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} placeholder={formData.uomType === 'ZERO' ? '0' : 'Target value'} />
            </div>

            <div className={styles.inputGroup}>
              <label>Weightage (%)</label>
              <input required type="number" min="10" max="100" value={formData.weightage} onChange={e => setFormData({...formData, weightage: e.target.value})} placeholder="Min 10%" />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={handleCancel} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Saving...' : 'Save Goal'}</button>
          </div>
        </form>
      )}

      <div className={styles.goalsList}>
        {goals.map(goal => (
          <div key={goal.id} className={styles.goalCard}>
            <div className={styles.goalInfo}>
              <h3>{goal.title}</h3>
              <p>{goal.thrustArea} • {goal.uomType === 'MIN' ? 'Higher is better' : goal.uomType === 'MAX' ? 'Lower is better' : goal.uomType}</p>
            </div>
            <div className={styles.goalMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Target</span>
                <span className={styles.metaValue} style={{ color: 'var(--foreground)' }}>{goal.target}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Weightage</span>
                <span className={styles.metaValue}>{goal.weightage}%</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button onClick={() => handleEdit(goal)} className={styles.btnSecondary} style={{ padding: '0.4rem' }} disabled={isAdding}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(goal.id)} className={styles.btnDanger} style={{ padding: '0.4rem' }} disabled={isAdding}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
