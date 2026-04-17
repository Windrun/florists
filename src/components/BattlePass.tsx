import { useState, useEffect } from 'react';
import { User, BattlePassLevel } from '../types';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '../App';

interface BattlePassProps {
  userData: User | null;
  onRefresh?: () => void;
}

const BATTLE_PASS_LEVELS: BattlePassLevel[] = [
  { level: 1, expRequired: 0, rewardFree: { type: 'coins', amount: 50 }, rewardPremium: { type: 'coins', amount: 100 } },
  { level: 2, expRequired: 100, rewardFree: { type: 'seed', itemId: 'daisy' }, rewardPremium: { type: 'pot_skin', itemId: 'clay' } },
  { level: 3, expRequired: 250, rewardFree: { type: 'coins', amount: 75 }, rewardPremium: { type: 'gems', amount: 10 } },
  { level: 4, expRequired: 450, rewardFree: { type: 'seed', itemId: 'rose' }, rewardPremium: { type: 'pot_skin', itemId: 'golden' } },
  { level: 5, expRequired: 700, rewardFree: { type: 'coins', amount: 100 }, rewardPremium: { type: 'gems', amount: 25 } },
  { level: 6, expRequired: 1000, rewardFree: { type: 'seed', itemId: 'tulip' }, rewardPremium: { type: 'pot_skin', itemId: 'crystal' } },
  { level: 7, expRequired: 1400, rewardFree: { type: 'coins', amount: 150 }, rewardPremium: { type: 'gems', amount: 30 } },
  { level: 8, expRequired: 2000, rewardFree: { type: 'pot_skin', itemId: 'rainbow' }, rewardPremium: { type: 'gems', amount: 50 } },
];

const BattlePass = ({ userData, onRefresh }: BattlePassProps) => {
  const { showToast } = useToast();
  const [hasPremium, setHasPremium] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [claimedFree, setClaimedFree] = useState<number[]>([]);
  const [claimedPremium, setClaimedPremium] = useState<number[]>([]);

  const currentExp = userData?.battlePassExp || 0;
  
  const currentLevelData = BATTLE_PASS_LEVELS.find(
    l => currentExp >= l.expRequired && 
    (BATTLE_PASS_LEVELS[BATTLE_PASS_LEVELS.indexOf(l) + 1]?.expRequired > currentExp || !BATTLE_PASS_LEVELS[BATTLE_PASS_LEVELS.indexOf(l) + 1])
  );
  
  const currentLevel = currentLevelData?.level || 1;
  const nextLevelData = BATTLE_PASS_LEVELS.find(l => l.level === currentLevel + 1);
  
  const expForCurrentLevel = currentLevelData?.expRequired || 0;
  const expForNextLevel = nextLevelData?.expRequired || expForCurrentLevel;
  const expNeededForLevel = expForNextLevel - expForCurrentLevel;
  const expProgressInLevel = currentExp - expForCurrentLevel;
  const progressPercent = expNeededForLevel > 0 
    ? Math.min(100, (expProgressInLevel / expNeededForLevel) * 100) 
    : 100;

  useEffect(() => {
    if (userData) {
      const savedFree = localStorage.getItem(`bp_claimed_free_${userData.uid}`);
      const savedPremium = localStorage.getItem(`bp_claimed_premium_${userData.uid}`);
      if (savedFree) setClaimedFree(JSON.parse(savedFree));
      if (savedPremium) setClaimedPremium(JSON.parse(savedPremium));
    }
  }, [userData]);

  const handleClaim = async (level: number, type: 'free' | 'premium') => {
    if (!userData) return;

    const levelData = BATTLE_PASS_LEVELS.find(l => l.level === level);
    if (!levelData) return;

    const reward = levelData.rewardFree;

    setClaiming(level);

    try {
      const userRef = doc(db, 'users', userData.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const currentCoins = userSnap.data().coins || 0;
      const currentGems = userSnap.data().gems || 0;
      const ownedSkins = userSnap.data().ownedPotSkins || [];
      const ownedSeeds = userSnap.data().ownedFlowerSeeds || [];

      const updates: Record<string, unknown> = {};

      switch (reward.type) {
        case 'coins':
          updates.coins = currentCoins + (reward.amount || 0);
          showToast(`+${reward.amount} 🪙!`, 'success');
          break;
        case 'gems':
          updates.gems = currentGems + (reward.amount || 0);
          showToast(`+${reward.amount} 💎!`, 'success');
          break;
        case 'pot_skin':
          if (reward.itemId && !ownedSkins.includes(reward.itemId)) {
            updates.ownedPotSkins = [...ownedSkins, reward.itemId];
          }
          showToast(`🏺 ${reward.itemId} unlocked!`, 'success');
          break;
        case 'seed':
          if (reward.itemId && !ownedSeeds.includes(reward.itemId as 'daisy' | 'rose' | 'tulip')) {
            updates.ownedFlowerSeeds = [...ownedSeeds, reward.itemId];
          }
          showToast(`🌱 ${reward.itemId} unlocked!`, 'success');
          break;
      }

      await updateDoc(userRef, updates);

      if (type === 'free') {
        const newClaimed = [...claimedFree, level];
        setClaimedFree(newClaimed);
        localStorage.setItem(`bp_claimed_free_${userData.uid}`, JSON.stringify(newClaimed));
      } else {
        const newClaimed = [...claimedPremium, level];
        setClaimedPremium(newClaimed);
        localStorage.setItem(`bp_claimed_premium_${userData.uid}`, JSON.stringify(newClaimed));
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast('Ошибка при получении награды', 'error');
    } finally {
      setClaiming(null);
    }
  };

  const canClaim = (level: number, type: 'free' | 'premium'): boolean => {
    if (level > currentLevel) return false;
    if (type === 'free') return !claimedFree.includes(level);
    return hasPremium && !claimedPremium.includes(level);
  };

  const getRewardIcon = (type: string, amount?: number) => {
    switch (type) {
      case 'coins': return `🪙 ${amount}`;
      case 'gems': return `💎 ${amount}`;
      case 'seed': return '🌱';
      case 'pot_skin': return '🏺';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">🌸 Цветочный пропуск</h2>
            <p className="opacity-90 text-sm">Выполняйте действия и получайте награды</p>
          </div>
          <button
            onClick={() => setHasPremium(!hasPremium)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              hasPremium
                ? 'bg-yellow-500 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {hasPremium ? '✨ Премиум' : '💎 Купить'}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl font-bold">
            {currentLevel}
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Уровень {currentLevel}</span>
              <span className="font-medium">
                {nextLevelData ? (
                  <>
                    {expProgressInLevel} / {expNeededForLevel} XP
                    <span className="opacity-70"> до уровня {nextLevelData.level}</span>
                  </>
                ) : (
                  '⭐ Максимальный уровень!'
                )}
              </span>
            </div>
            <div className="h-4 bg-white/20 dark:bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 text-sm">
          <div className="bg-white/10 px-3 py-1 rounded-lg">
            🌱 Посадка: +5 XP
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg">
            🪙 Сбор: +10 XP
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg">
            💧 Помощь: +3 XP
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {BATTLE_PASS_LEVELS.map((level) => {
          const isUnlocked = level.level <= currentLevel;
          const freeClaimable = canClaim(level.level, 'free');
          const premiumClaimable = canClaim(level.level, 'premium');

          return (
            <div
              key={level.level}
              className={`border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm transition-all dark:border-gray-700 ${
                !isUnlocked ? 'opacity-50 grayscale' : ''
              } ${level.level === currentLevel ? 'ring-2 ring-green-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isUnlocked 
                      ? level.level === currentLevel 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' 
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    {level.level}
                  </div>
                  <div>
                    <div className="font-semibold dark:text-gray-200">Уровень {level.level}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {level.expRequired} XP
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Бесплатно</div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 font-medium dark:text-gray-200">
                      {getRewardIcon(level.rewardFree.type, level.rewardFree.amount)}
                    </div>
                    {freeClaimable && isUnlocked ? (
                      <button
                        onClick={() => handleClaim(level.level, 'free')}
                        disabled={claiming === level.level}
                        className="mt-2 w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {claiming === level.level ? '...' : 'Забрать'}
                      </button>
                    ) : claimedFree.includes(level.level) ? (
                      <div className="mt-2 text-xs text-green-500 font-medium">✓</div>
                    ) : null}
                  </div>

                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Премиум</div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg px-3 py-2 font-medium dark:text-gray-200">
                      {getRewardIcon(level.rewardPremium.type, level.rewardPremium.amount)}
                    </div>
                    {premiumClaimable && isUnlocked && hasPremium ? (
                      <button
                        onClick={() => handleClaim(level.level, 'premium')}
                        disabled={claiming === level.level}
                        className="mt-2 w-full text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {claiming === level.level ? '...' : 'Забрать'}
                      </button>
                    ) : claimedPremium.includes(level.level) ? (
                      <div className="mt-2 text-xs text-green-500 font-medium">✓</div>
                    ) : (
                      <div className="mt-2 text-xs text-gray-400">🔒</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BattlePass;
