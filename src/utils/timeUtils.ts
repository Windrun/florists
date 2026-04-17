const GROWTH_TIMES: Record<string, number> = {
  daisy: 3600,
  rose: 7200,
  tulip: 10800,
  sunflower: 14400,
  orchid: 21600,
  gift_rose: 7200,
};

export const getGrowthTime = (flowerType: string): number => {
  return GROWTH_TIMES[flowerType] || 3600;
};

export const getTimeRemaining = (plantedAt: number, flowerType: string): number => {
  const now = Date.now();
  const elapsed = (now - plantedAt) / 1000;
  const growthTime = GROWTH_TIMES[flowerType] || 3600;
  const remaining = growthTime - elapsed;
  return Math.max(0, Math.floor(remaining));
};

export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '0с';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  }
  return `${secs}с`;
};

export const isFlowerReady = (plantedAt: number, flowerType: string): boolean => {
  const now = Date.now();
  const elapsed = (now - plantedAt) / 1000;
  return elapsed >= GROWTH_TIMES[flowerType];
};

export const getFlowerReward = (flowerType: string): number => {
  const rewards: Record<string, number> = {
    daisy: 10,
    rose: 15,
    tulip: 20,
  };
  return rewards[flowerType] || 10;
};
