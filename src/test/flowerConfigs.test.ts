import { describe, it, expect } from 'vitest';
import { FLOWER_CONFIGS, getFlowerConfig, getFlowerReward, getFlowerGrowthTime, DEFAULT_FLOWERS, PREMIUM_FLOWERS } from '../src/utils/flowerConfigs';

describe('flowerConfigs', () => {
  it('should have correct flower types', () => {
    expect(FLOWER_CONFIGS.daisy).toBeDefined();
    expect(FLOWER_CONFIGS.rose).toBeDefined();
    expect(FLOWER_CONFIGS.tulip).toBeDefined();
    expect(FLOWER_CONFIGS.sunflower).toBeDefined();
    expect(FLOWER_CONFIGS.orchid).toBeDefined();
    expect(FLOWER_CONFIGS.gift_rose).toBeDefined();
  });

  it('should return correct rewards', () => {
    expect(getFlowerReward('daisy')).toBe(10);
    expect(getFlowerReward('rose')).toBe(15);
    expect(getFlowerReward('tulip')).toBe(20);
    expect(getFlowerReward('sunflower')).toBe(30);
    expect(getFlowerReward('orchid')).toBe(50);
  });

  it('should return correct growth times', () => {
    expect(getFlowerGrowthTime('daisy')).toBe(3600);
    expect(getFlowerGrowthTime('rose')).toBe(7200);
    expect(getFlowerGrowthTime('tulip')).toBe(10800);
    expect(getFlowerGrowthTime('sunflower')).toBe(14400);
    expect(getFlowerGrowthTime('orchid')).toBe(21600);
  });

  it('should have default flowers available', () => {
    expect(DEFAULT_FLOWERS.length).toBe(3);
    expect(DEFAULT_FLOWERS.map(f => f.type)).toContain('daisy');
    expect(DEFAULT_FLOWERS.map(f => f.type)).toContain('rose');
    expect(DEFAULT_FLOWERS.map(f => f.type)).toContain('tulip');
  });

  it('should have premium flowers', () => {
    expect(PREMIUM_FLOWERS.length).toBe(3);
    expect(PREMIUM_FLOWERS.map(f => f.type)).toContain('sunflower');
    expect(PREMIUM_FLOWERS.map(f => f.type)).toContain('orchid');
    expect(PREMIUM_FLOWERS.map(f => f.type)).toContain('gift_rose');
  });

  it('should identify premium flowers', () => {
    expect(getFlowerConfig('orchid').isPremium).toBe(true);
    expect(getFlowerConfig('daisy').isPremium).toBeUndefined();
  });

  it('should identify giftable flowers', () => {
    expect(getFlowerConfig('gift_rose').canGift).toBe(true);
    expect(getFlowerConfig('daisy').canGift).toBeUndefined();
  });
});