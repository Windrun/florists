import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, checkAchievement, getUserProgress } from '../src/utils/achievements';

describe('achievements', () => {
  const mockUser = {
    totalPlants: 15,
    totalHarvests: 10,
    totalHelps: 5,
    dailyStreak: 3,
    coins: 500,
    gems: 10,
    friends: [{ uid: '1' }, { uid: '2' }],
  };

  it('should have achievements defined', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  it('should return correct user progress for plants', () => {
    expect(getUserProgress(mockUser, 'plants')).toBe(15);
    expect(getUserProgress(mockUser, 'harvests')).toBe(10);
    expect(getUserProgress(mockUser, 'helps')).toBe(5);
    expect(getUserProgress(mockUser, 'streak')).toBe(3);
    expect(getUserProgress(mockUser, 'coins')).toBe(500);
    expect(getUserProgress(mockUser, 'gems')).toBe(10);
    expect(getUserProgress(mockUser, 'friends')).toBe(2);
  });

  it('should check achievements correctly', () => {
    const firstPlant = ACHIEVEMENTS.find(a => a.id === 'first_plant')!;
    expect(checkAchievement(mockUser, firstPlant)).toBe(true);

    const plant100 = ACHIEVEMENTS.find(a => a.id === 'plant_100')!;
    expect(checkAchievement(mockUser, plant100)).toBe(false);
  });

  it('should verify plant achievement requirements', () => {
    const plant10 = ACHIEVEMENTS.find(a => a.id === 'plant_10')!;
    expect(plant10.requirement).toBe(10);
    expect(plant10.type).toBe('plants');
  });
});