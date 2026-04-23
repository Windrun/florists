export const ENERGY_CONFIG = {
  maxEnergy: 20,
  energyPerPlant: 1,
  refillTimeMinutes: 30,
  energyGainPerHelp: 1,
};

export const getEnergyRechargeTime = (lastRefill: number): number => {
  const now = Date.now();
  const timeSinceRefill = now - lastRefill;
  const refillInterval = ENERGY_CONFIG.refillTimeMinutes * 60 * 1000;
  const energyGained = Math.floor(timeSinceRefill / refillInterval);
  return Math.min(energyGained, ENERGY_CONFIG.maxEnergy);
};

export const calculateEnergy = (
  currentEnergy: number,
  lastEnergyRefill: number
): number => {
  const energyToAdd = getEnergyRechargeTime(lastEnergyRefill);
  return Math.min(currentEnergy + energyToAdd, ENERGY_CONFIG.maxEnergy);
};

export const canPlant = (energy: number): boolean => {
  return energy >= ENERGY_CONFIG.energyPerPlant;
};

export const useEnergy = (energy: number): number => {
  return Math.max(0, energy - ENERGY_CONFIG.energyPerPlant);
};