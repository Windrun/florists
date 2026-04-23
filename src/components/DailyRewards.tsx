import { useState, useEffect } from 'react';
import { User } from '../types';
import { getDailyRewardStatus, claimDailyReward } from '../services/userService';
import { useToast } from '../App';

interface DailyRewardsProps {
  user: User | null;
  onRefresh: () => void;
}

const DAILY_REWARDS = [
  { day: 1, coins: 10, gems: 0 },
  { day: 2, coins: 15, gems: 0 },
  { day: 3, coins: 20, gems: 0 },
  { day: 4, coins: 25, gems: 1 },
  { day: 5, coins: 30, gems: 2 },
  { day: 6, coins: 40, gems: 3 },
  { day: 7, coins: 100, gems: 10 },
];

const DailyRewards = ({ user, onRefresh }: DailyRewardsProps) => {
  const { showToast } = useToast();
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(1);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [user.uid]);

  const loadStatus = async () => {
    const { getDailyRewardStatus } = await import('../services/userService');
    const status = await getDailyRewardStatus(user.uid);
    setCanClaim(status.canClaim);
    setStreak(status.streak);
  };

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    
    setClaiming(true);
    try {
      const { claimDailyReward } = await import('../services/userService');
      const result = await claimDailyReward(user.uid);
      
      if (result.success) {
        showToast(result.message, 'success');
        await loadStatus();
        onRefresh();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('Ошибка', 'error');
    } finally {
      setClaiming(false);
    }
  };

  const currentStreak = user.dailyStreak || 0;

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <div>
            <div className="text-white font-bold">Ежедневные награды</div>
            <div className="text-yellow-100 text-xs">Day {currentStreak} / 7</div>
          </div>
        </div>
        <button
          onClick={handleClaim}
          disabled={!canClaim || claiming}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 ${
            canClaim
              ? 'bg-white text-orange-500 shadow-lg'
              : 'bg-white/50 text-white/50 cursor-not-allowed'
          }`}
        >
          {claiming ? '...' : canClaim ? 'Получить!' : 'Получено'}
        </button>
      </div>

      <div className="flex justify-between gap-1">
        {DAILY_REWARDS.map((reward, index) => {
          const dayNum = index + 1;
          const isActive = dayNum <= currentStreak;
          const isToday = dayNum === currentStreak + 1 || (currentStreak === 0 && dayNum === 1);
          
          return (
            <div
              key={dayNum}
              className={`flex-1 text-center p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/90 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300'
                  : isToday && canClaim
                  ? 'bg-white/60 text-white animate-pulse'
                  : 'bg-white/20 text-white/50'
              }`}
            >
              <div className="text-lg font-bold">{dayNum}</div>
              <div className="text-xs">
                {reward.coins}🪙
                {reward.gems > 0 && <span className="ml-1">{reward.gems}💎</span>}
              </div>
              {isActive && (
                <div className="text-xs mt-1">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyRewards;
