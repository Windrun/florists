import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { User } from '../types';
import { useToast } from '../App';

interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  flowersHarvested: number;
  totalCoins: number;
}

const Leaderboard = () => {
  const { showToast } = useToast();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'today'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('totalDailyRewards', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      
      const entries: LeaderboardEntry[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          rank: index + 1,
          uid: doc.id,
          displayName: data.displayName || `Player ${doc.id.slice(0, 6)}`,
          flowersHarvested: data.flowers?.filter((f: { harvestedAt: number | null }) => f.harvestedAt !== null).length || 0,
          totalCoins: data.coins || 0,
        };
      });
      
      setLeaders(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showToast('Ошибка загрузки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400';
    if (rank === 2) return 'bg-gray-100 dark:bg-gray-700 border-gray-400';
    if (rank === 3) return 'bg-orange-100 dark:bg-orange-900/50 border-orange-400';
    return 'bg-white dark:bg-gray-800';
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-white font-bold">Таблица лидеров</div>
            <div className="text-indigo-100 text-xs">Топ игроки</div>
          </div>
        </div>
        <button
          onClick={loadLeaderboard}
          className="text-white/70 hover:text-white text-sm"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/70">
          Загрузка...
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-8 text-white/70">
          Пока нет данных
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.slice(0, 10).map((entry) => (
            <div
              key={entry.uid}
              className={`flex items-center justify-between p-2 rounded-lg border ${getRankClass(entry.rank)}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 text-center font-bold text-lg">
                  {getRankIcon(entry.rank) || entry.rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                  {entry.displayName}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-300 text-xs">Цветы</div>
                  <div className="font-bold text-green-600 dark:text-green-400">{entry.flowersHarvested}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-300 text-xs">Монеты</div>
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">🪙{entry.totalCoins}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {leaders.length > 10 && (
        <div className="text-center mt-3 text-white/70 text-sm">
          +{leaders.length - 10} игроков
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
