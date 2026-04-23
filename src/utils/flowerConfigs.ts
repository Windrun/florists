import { FlowerConfig, FlowerType } from '../types';

export const FLOWER_CONFIGS: Record<string, FlowerConfig> = {
  daisy: {
    type: 'daisy',
    name: 'Ромашка',
    growthTime: 3600,
    reward: 10,
    emoji: '🌼',
    description: 'Простой и милый цветок',
  },
  rose: {
    type: 'rose',
    name: 'Роза',
    growthTime: 7200,
    reward: 15,
    emoji: '🌹',
    description: 'Классическая роза',
  },
  tulip: {
    type: 'tulip',
    name: 'Тюльпан',
    growthTime: 10800,
    reward: 20,
    emoji: '🌷',
    description: 'Весенний тюльпан',
  },
  sunflower: {
    type: 'sunflower',
    name: 'Подсолнух',
    growthTime: 14400,
    reward: 30,
    emoji: '🌻',
    description: 'Солнечный цветок',
  },
  orchid: {
    type: 'orchid',
    name: 'Орхидея',
    growthTime: 21600,
    reward: 50,
    emoji: '🌺',
    description: 'Экзотическая орхидея',
    isPremium: true,
  },
  gift_rose: {
    type: 'gift_rose',
    name: 'Роза с лентой',
    growthTime: 7200,
    reward: 25,
    emoji: '🌹🎀',
    description: 'Роза для подарка другу',
    canGift: true,
  },
};

export const DEFAULT_FLOWERS: FlowerConfig[] = [
  FLOWER_CONFIGS.daisy,
  FLOWER_CONFIGS.rose,
  FLOWER_CONFIGS.tulip,
];

export const PREMIUM_FLOWERS: FlowerConfig[] = [
  FLOWER_CONFIGS.sunflower,
  FLOWER_CONFIGS.orchid,
  FLOWER_CONFIGS.gift_rose,
];

export const getFlowerConfig = (type: FlowerType): FlowerConfig => {
  return FLOWER_CONFIGS[type] || FLOWER_CONFIGS.daisy;
};

export const getFlowerReward = (type: FlowerType): number => {
  return FLOWER_CONFIGS[type]?.reward || 10;
};

export const getFlowerGrowthTime = (type: FlowerType): number => {
  return FLOWER_CONFIGS[type]?.growthTime || 3600;
};

export const getFlowerEmoji = (type: FlowerType): string => {
  return FLOWER_CONFIGS[type]?.emoji || '🌸';
};

export const getFlowerName = (type: FlowerType): string => {
  return FLOWER_CONFIGS[type]?.name || 'Цветок';
};