import { useState, useEffect } from 'react';
import { User } from '../types';
import { ACHIEVEMENTS, checkAchievement, Achievement, getUserProgress } from '../utils/achievements';
import { useToast } from '../App';
import { addBattlePassExp } from '../services/userService';

interface AchievementsProps {
  user: User | null;
}

const Achievements = ({ user }: AchievementsProps) => {
  const { showToast } = useToast();
  const [claimed, setClaimed] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const saved = localStorage.getItem(`achievements_${user.uid}`);
      if (saved) {
        setClaimed(JSON.parse(saved));
      }
    }
  }, [user?.uid]);

  const handleClaim = async (achievement: Achievement) => {
    if (!user || claimed.includes(achievement.id)) return;
    
    try {
      await addBattlePassExp(user.uid, achievement.xpReward);
    } catch (e) {
      console.error('Failed to add XP:', e);
    }
    
    const newClaimed = [...claimed, achievement.id];
    setClaimed(newClaimed);
    localStorage.setItem(`achievements_${user.uid}`, JSON.stringify(newClaimed));
    showToast(`🏆 ${achievement.name}! +${achievement.xpReward} XP`, 'xp');
  };

  const unclaimedAchievements = ACHIEVEMENTS.filter(a => !claimed.includes(a.id));
  const displayed = showAll ? unclaimedAchievements : unclaimedAchievements.slice(0, 6);

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:border dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-bold dark:text-gray-200">Достижения</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {claimed.length} / {ACHIEVEMENTS.length}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayed.map((achievement) => {
          const progress = getUserProgress(user, achievement.type);
          const isUnlocked = progress >= achievement.requirement;
          const isClaimed = claimed.includes(achievement.id);
          
          return (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border transition-all ${
                isClaimed
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
                  : isUnlocked
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm dark:text-gray-200 truncate">{achievement.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</div>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isUnlocked ? 'bg-yellow-500' : 'bg-gray-400 dark:bg-gray-500'
                    }`}
                    style={{ width: `${Math.min(100, (progress / achievement.requirement) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress} / {achievement.requirement}
                </div>
              </div>

              {isUnlocked && !isClaimed && (
                <button
                  onClick={() => handleClaim(achievement)}
                  className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1.5 rounded-lg font-medium transition-colors"
                >
                  Получить +{achievement.xpReward} XP
                </button>
              )}
              
              {isClaimed && (
                <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Получено
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unclaimedAchievements.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          {showAll ? 'Скрыть' : `Показать ещё (${unclaimedAchievements.length - 6})`}
        </button>
      )}
    </div>
  );
};

export default Achievements;