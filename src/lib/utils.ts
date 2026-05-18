export function computeProgressScore(uomType: string, targetStr: string, achievementStr: string): number {
  if (!achievementStr) return 0;

  try {
    if (uomType === 'MIN') {
      const target = parseFloat(targetStr);
      const ach = parseFloat(achievementStr);
      if (isNaN(target) || isNaN(ach)) return 0;
      return Math.min(100, Math.max(0, (ach / target) * 100));
    }
    
    if (uomType === 'MAX') {
      const target = parseFloat(targetStr);
      const ach = parseFloat(achievementStr);
      if (isNaN(target) || isNaN(ach)) return 0;
      return Math.min(100, Math.max(0, (target / ach) * 100));
    }
    
    if (uomType === 'TIMELINE') {
      // Basic date comparison
      const targetDate = new Date(targetStr).getTime();
      const achDate = new Date(achievementStr).getTime();
      if (isNaN(targetDate) || isNaN(achDate)) return 0;
      return achDate <= targetDate ? 100 : 0;
    }
    
    if (uomType === 'ZERO') {
      const ach = parseFloat(achievementStr);
      if (isNaN(ach)) return 0;
      return ach === 0 ? 100 : 0;
    }

    return 0;
  } catch (e) {
    return 0;
  }
}
