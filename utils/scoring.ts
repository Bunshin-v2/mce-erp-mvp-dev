// MODULE 4: WIN PROBABILITY ENGINE
// Implements the algorithmic scoring defined in Enterprise Architecture Plan

interface ScoringFactors {
  clientTier: 'Tier 1' | 'Tier 2' | 'Tier 3'; // Tier 1 = Govt/Semi-Govt (High Trust)
  competitorCount: number;
  ourCapacityLoad: number; // 0-100%
  isDesignAndBuild: boolean; // D&B usually has higher margins/win-rate for MCE
  hasIncumbentAdvantage: boolean;
}

export const calculateWinProbability = (factors: ScoringFactors): { score: number, label: string, color: string } => {
  let score = 50; // Base Probability

  // 1. Client Quality (+/- 15)
  if (factors.clientTier === 'Tier 1') score += 15;
  if (factors.clientTier === 'Tier 3') score -= 15;

  // 2. Competition (-5 per competitor above 3)
  if (factors.competitorCount > 3) {
    score -= (factors.competitorCount - 3) * 5;
  }

  // 3. Capacity (If overloaded, we bid high/lose)
  if (factors.ourCapacityLoad > 90) score -= 20;
  if (factors.ourCapacityLoad < 50) score += 10; // Hungry for work

  // 4. Strategic Advantages
  if (factors.isDesignAndBuild) score += 10;
  if (factors.hasIncumbentAdvantage) score += 25;

  // Clamp
  score = Math.min(Math.max(score, 0), 99);

  // Labeling
  let label = 'LOW';
  let color = 'text-rose-500';

  if (score >= 75) {
    label = 'HIGH';
    color = 'text-emerald-500';
  } else if (score >= 50) {
    label = 'MEDIUM';
    color = 'text-amber-500';
  }

  return { score, label, color };
};
