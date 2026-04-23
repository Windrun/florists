import { describe, it, expect } from 'vitest';
import { ENERGY_CONFIG, calculateEnergy, canPlant, useEnergy } from '../src/utils/energyUtils';

describe('energyUtils', () => {
  it('should have correct config values', () => {
    expect(ENERGY_CONFIG.maxEnergy).toBe(20);
    expect(ENERGY_CONFIG.energyPerPlant).toBe(1);
    expect(ENERGY_CONFIG.refillTimeMinutes).toBe(30);
    expect(ENERGY_CONFIG.energyGainPerHelp).toBe(1);
  });

  it('should calculate energy correctly', () => {
    const now = Date.now();
    expect(calculateEnergy(20, now)).toBe(20);
    expect(calculateEnergy(10, now)).toBe(10);
  });

  it('should check if can plant', () => {
    expect(canPlant(1)).toBe(true);
    expect(canPlant(5)).toBe(true);
    expect(canPlant(0)).toBe(false);
  });

  it('should use energy correctly', () => {
    expect(useEnergy(5)).toBe(4);
    expect(useEnergy(1)).toBe(0);
    expect(useEnergy(0)).toBe(0);
  });
});