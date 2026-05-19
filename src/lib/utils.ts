export function computeProgressScore(uomType: string, targetStr: string, achievementStr: string): number {
  if (!achievementStr) return 0;

  try {
    if (uomType === 'MIN') {
      // Higher is better (e.g., revenue, units sold)
      const target = parseFloat(targetStr);
      const ach = parseFloat(achievementStr);
      if (isNaN(target) || isNaN(ach) || target === 0) return 0;
      return Math.min(100, Math.max(0, (ach / target) * 100));
    }
    
    if (uomType === 'MAX') {
      // Lower is better (e.g., defect rate, cost)
      const target = parseFloat(targetStr);
      const ach = parseFloat(achievementStr);
      if (isNaN(target) || isNaN(ach)) return 0;
      if (ach === 0) return 100; // Perfect score if actual is 0 and lower is better
      return Math.min(100, Math.max(0, (target / ach) * 100));
    }
    
    if (uomType === 'TIMELINE') {
      // Date-based: on-time or early = 100, graduated penalty for lateness
      const targetDate = new Date(targetStr).getTime();
      const achDate = new Date(achievementStr).getTime();
      if (isNaN(targetDate) || isNaN(achDate)) return 0;
      if (achDate <= targetDate) return 100;
      // Graduated: lose 1% per day late, floor at 0
      const daysLate = (achDate - targetDate) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.round(100 - daysLate));
    }
    
    if (uomType === 'ZERO') {
      // Zero-based: 0 incidents = 100%, graduated penalty per incident
      const ach = parseFloat(achievementStr);
      if (isNaN(ach)) return 0;
      if (ach === 0) return 100;
      return Math.max(0, Math.round(100 - (ach * 25))); // -25% per incident
    }

    return 0;
  } catch {
    return 0;
  }
}
