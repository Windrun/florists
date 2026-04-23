export type FlowerType = 'daisy' | 'rose' | 'tulip' | 'sunflower' | 'orchid' | 'gift_rose';

export interface FlowerConfig {
  type: FlowerType;
  name: string;
  growthTime: number;
  reward: number;
  emoji: string;
  description: string;
  isPremium?: boolean;
  canGift?: boolean;
}

export interface Flower {
  id: string;
  type: FlowerType;
  plantedAt: number;
  harvestedAt: number | null;
  helperIds: string[];
  ownerId: string;
  potSkin: string;
}

export interface Friend {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  addedAt: number;
}

export interface DailyReward {
  day: number;
  coins: number;
  gems?: number;
  isPremium?: boolean;
}

export interface DailyTask {
  id: string;
  type: 'plant' | 'harvest' | 'help' | 'sell';
  target: number;
  progress: number;
  claimed: boolean;
  expiresAt: number;
}

export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  coins: number;
  gems: number;
  flowers: Flower[];
  createdAt: number;
  lastActiveAt: number;
  ownedPotSkins: string[];
  ownedFlowerSeeds: FlowerType[];
  battlePassLevel: number;
  battlePassExp: number;
  inviteCode: string;
  friends: Friend[];
  dailyStreak: number;
  lastDailyReward: number;
  totalDailyRewards: number;
  dailyTasks: DailyTask[];
  lastTaskReset: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefill: number;
  totalPlants: number;
  totalHarvests: number;
  totalHelps: number;
}

export interface AuctionListing {
  id: string;
  sellerId: string;
  flowerId: string;
  flowerType: FlowerType;
  potSkin: string;
  price: number;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'expired';
  buyerId?: string;
}

export interface ShopItem {
  id: string;
  type: 'pot_skin' | 'seed' | 'gem_pack';
  name: string;
  priceGems: number;
  priceCoins: number | null;
  imageUrl: string;
  data: Record<string, unknown>;
}

export interface BattlePassLevel {
  level: number;
  expRequired: number;
  rewardFree: BattlePassReward;
  rewardPremium: BattlePassReward;
}

export interface BattlePassReward {
  type: 'coins' | 'gems' | 'pot_skin' | 'seed';
  amount?: number;
  itemId?: string;
}
