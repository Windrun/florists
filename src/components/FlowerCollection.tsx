import { useState, useEffect } from 'react';
import { User, Flower } from '../types';

interface CollectionStats {
  totalFlowers: number;
  harvestedFlowers: number;
  uniqueTypes: number;
  helpGiven: number;
  friendsCount: number;
  auctionsSold: number;
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flower', icon: '🌸', title: 'Первый цветок', description: 'Собери первый урожай', unlocked: false },
  { id: 'flower_10', icon: '🌺', title: 'Садовник', description: 'Собери 10 цветов', unlocked: false },
  { id: 'flower_50', icon: '🌻', title: 'Мастер садовод', description: 'Собери 50 цветов', unlocked: false },
  { id: 'flower_100', icon: '🌹', title: 'Легенда сада', description: 'Собери 100 цветов', unlocked: false },
  { id: 'helper_10', icon: '💧', title: 'Помощник', description: 'Помоги 10 раз', unlocked: false },
  { id: 'helper_50', icon: '🌊', title: 'Благодетель', description: 'Помоги 50 раз', unlocked: false },
  { id: 'friend_5', icon: '👥', title: 'Друзья', description: 'Добавь 5 друзей', unlocked: false },
  { id: 'all_types', icon: '💎', title: 'Коллекционер', description: 'Собери все типы цветов', unlocked: false },
];

const FlowerCollection = ({ user }: { user: User }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [stats, setStats] = useState<CollectionStats>({
    totalFlowers: 0,
    harvestedFlowers: 0,
    uniqueTypes: 0,
    helpGiven: 0,
    friendsCount: 0,
    auctionsSold: 0,
  });

  useEffect(() => {
    if (!user) return;

    const harvestedFlowers = user.flowers?.filter(f => f.harvestedAt !== null).length || 0;
    const uniqueTypes = new Set(user.flowers?.filter(f => f.harvestedAt !== null).map(f => f.type) || []).size;
    const helpGiven = user.flowers?.reduce((acc, f) => acc + (f.helperIds?.length || 0), 0) || 0;

    setStats({
      totalFlowers: user.flowers?.length || 0,
      harvestedFlowers,
      uniqueTypes,
      helpGiven,
      friendsCount: user.friends?.length || 0,
      auctionsSold: 0,
    });

    const newAchievements = ACHIEVEMENTS.map(a => {
      let unlocked = false;
      
      switch (a.id) {
        case 'first_flower':
          unlocked = harvestedFlowers >= 1;
          break;
        case 'flower_10':
          unlocked = harvestedFlowers >= 10;
          break;
        case 'flower_50':
          unlocked = harvestedFlowers >= 50;
          break;
        case 'flower_100':
          unlocked = harvestedFlowers >= 100;
          break;
        case 'helper_10':
          unlocked = helpGiven >= 10;
          break;
        case 'helper_50':
          unlocked = helpGiven >= 50;
          break;
        case 'friend_5':
          unlocked = (user.friends?.length || 0) >= 5;
          break;
        case 'all_types':
          unlocked = uniqueTypes >= 3;
          break;
      }
      return { ...a, unlocked };
    });

    setAchievements(newAchievements);
  }, [user]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏅</span>
          <div>
            <div className="text-white font-bold">Коллекция</div>
            <div className="text-pink-100 text-xs">
              {unlockedCount} / {achievements.length} достижений
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 text-center">
          <div className="text-2xl">🌸</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Собрано</div>
          <div className="font-bold text-green-600 dark:text-green-400">{stats.harvestedFlowers}</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 text-center">
          <div className="text-2xl">💧</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Помог</div>
          <div className="font-bold text-blue-600 dark:text-blue-400">{stats.helpGiven}</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 text-center">
          <div className="text-2xl">👥</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Друзья</div>
          <div className="font-bold text-purple-600 dark:text-purple-400">{stats.friendsCount}</div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 text-center">
          <div className="text-2xl">🌈</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Видов</div>
          <div className="font-bold text-orange-600 dark:text-orange-400">{stats.uniqueTypes}/3</div>
        </div>
      </div>

      <div className="space-y-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              achievement.unlocked
                ? 'bg-white/90 dark:bg-gray-800/90'
                : 'bg-white/30 opacity-60'
            }`}
          >
            <div className="text-2xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${achievement.unlocked ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
                {achievement.title}
              </div>
              <div className={`text-xs ${achievement.unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>
                {achievement.description}
              </div>
            </div>
            {achievement.unlocked && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowerCollection;
