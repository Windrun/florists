export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: string[];
  bonus: { type: 'coins' | 'gems' | 'xp'; amount: number };
}

export const POT_COLLECTIONS: Collection[] = [
  {
    id: 'starter',
    name: 'Набор новичка',
    description: 'Базовые горшки',
    icon: '🏺',
    items: ['default'],
    bonus: { type: 'xp', amount: 0 },
  },
  {
    id: 'clay',
    name: 'Глиняная коллекция',
    description: 'Глиняные горшки',
    icon: '🏺',
    items: ['clay'],
    bonus: { type: 'coins', amount: 50 },
  },
  {
    id: 'golden',
    name: 'Золото',
    description: 'Золотые горшки',
    icon: '✨',
    items: ['golden'],
    bonus: { type: 'gems', amount: 5 },
  },
  {
    id: 'crystal',
    name: 'Хрусталь',
    description: 'Хрустальные горшки',
    icon: '💎',
    items: ['crystal'],
    bonus: { type: 'gems', amount: 10 },
  },
  {
    id: 'rainbow',
    name: 'Радуга',
    description: 'Все цвета радуги',
    icon: '🌈',
    items: ['rainbow'],
    bonus: { type: 'gems', amount: 15 },
  },
];

export const FLOWER_COLLECTIONS: Collection[] = [
  {
    id: 'basic_flowers',
    name: 'Базовые цветы',
    description: 'Ромашка, Роза, Тюльпан',
    icon: '🌸',
    items: ['daisy', 'rose', 'tulip'],
    bonus: { type: 'xp', amount: 0 },
  },
  {
    id: 'exotic',
    name: 'Экзотика',
    description: 'Подсолнух и Орхидея',
    icon: '🌺',
    items: ['sunflower', 'orchid'],
    bonus: { type: 'coins', amount: 100 },
  },
  {
    id: 'premium',
    name: 'Премиум',
    description: 'Все премиум цветы',
    icon: '👑',
    items: ['orchid', 'gift_rose'],
    bonus: { type: 'gems', amount: 20 },
  },
];

export const checkCollectionComplete = (owned: string[], collection: Collection): boolean => {
  return collection.items.every(item => owned.includes(item));
};

export const getCollectionProgress = (owned: string[], collection: Collection): number => {
  return collection.items.filter(item => owned.includes(item)).length;
};