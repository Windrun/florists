export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'plants' | 'harvests' | 'helps' | 'friends' | 'streak' | 'coins' | 'gems';
  xpReward: number;
  claimed?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_plant', name: 'Первая посадка', description: 'Посади 1 цветок', icon: '🌱', requirement: 1, type: 'plants', xpReward: 10 },
  { id: 'plant_10', name: 'Начинающий садовод', description: 'Посади 10 цветов', icon: '🌿', requirement: 10, type: 'plants', xpReward: 50 },
  { id: 'plant_50', name: 'Опытный садовод', description: 'Посади 50 цветов', icon: '🌳', requirement: 50, type: 'plants', xpReward: 100 },
  { id: 'plant_100', name: 'Мастер сада', description: 'Посади 100 цветов', icon: '🎋', requirement: 100, type: 'plants', xpReward: 200 },
  { id: 'first_harvest', name: 'Первый урожай', description: 'Собери 1 цветок', icon: '🪙', requirement: 1, type: 'harvests', xpReward: 10 },
  { id: 'harvest_10', name: 'Фермер', description: 'Собери 10 цветов', icon: '🌾', requirement: 10, type: 'harvests', xpReward: 50 },
  { id: 'harvest_50', name: 'Профессионал', description: 'Собери 50 цветов', icon: '🚜', requirement: 50, type: 'harvests', xpReward: 100 },
  { id: 'first_help', name: 'Помощник', description: 'Помоги 1 другу', icon: '💧', requirement: 1, type: 'helps', xpReward: 10 },
  { id: 'help_10', name: 'Добрый друг', description: 'Помоги 10 друзьям', icon: '🤝', requirement: 10, type: 'helps', xpReward: 50 },
  { id: 'help_50', name: 'Благодетель', description: 'Помоги 50 друзьям', icon: '👼', requirement: 50, type: 'helps', xpReward: 150 },
  { id: 'first_friend', name: 'Новые знакомства', description: 'Добавь 1 друга', icon: '👋', requirement: 1, type: 'friends', xpReward: 10 },
  { id: 'friend_5', name: 'Общительный', description: 'Добавь 5 друзей', icon: '🎉', requirement: 5, type: 'friends', xpReward: 50 },
  { id: 'friend_10', name: 'Душа компании', description: 'Добавь 10 друзей', icon: '⭐', requirement: 10, type: 'friends', xpReward: 100 },
  { id: 'streak_7', name: 'Недельный', description: 'Вход 7 дней подряд', icon: '📅', requirement: 7, type: 'streak', xpReward: 100 },
  { id: 'streak_30', name: 'Месячный', description: 'Вход 30 дней подряд', icon: '🏆', requirement: 30, type: 'streak', xpReward: 300 },
  { id: 'rich_1000', name: 'Начинающий богач', description: 'Накопи 1000 монет', icon: '💰', requirement: 1000, type: 'coins', xpReward: 50 },
  { id: 'rich_5000', name: 'Богач', description: 'Накопи 5000 монет', icon: '💎', requirement: 5000, type: 'coins', xpReward: 100 },
  { id: 'gem_collector', name: 'Кристаллы', description: 'Накопи 10 алмазов', icon: '💎', requirement: 10, type: 'gems', xpReward: 50 },
];

export const getUserProgress = (user: { totalPlants?: number; totalHarvests?: number; totalHelps?: number; dailyStreak?: number; coins?: number; gems?: number; friends?: { uid: string }[] }, type: Achievement['type']): number => {
  switch (type) {
    case 'plants': return user.totalPlants || 0;
    case 'harvests': return user.totalHarvests || 0;
    case 'helps': return user.totalHelps || 0;
    case 'streak': return user.dailyStreak || 0;
    case 'coins': return user.coins || 0;
    case 'gems': return user.gems || 0;
    case 'friends': return user.friends?.length || 0;
    default: return 0;
  }
};

export const checkAchievement = (user: { totalPlants?: number; totalHarvests?: number; totalHelps?: number; dailyStreak?: number; coins?: number; gems?: number; friends?: { uid: string }[] }, achievement: Achievement): boolean => {
  const progress = getUserProgress(user, achievement.type);
  return progress >= achievement.requirement;
};