import { useState } from 'react';
import { User, Flower } from '../types';
import { useFriends } from '../hooks/useFriends';
import { useFlowerTimer } from '../hooks/useFlowerTimer';
import { getFlowerEmoji, getFlowerName } from '../utils/flowerConfigs';

interface FriendsProps {
  currentUser: User | null;
  onHelp: (flowerId: string, ownerId: string) => void;
}

const FriendGarden = ({ friend, onHelp, currentUserId }: { friend: User; onHelp: (flowerId: string, ownerId: string) => void; currentUserId: string }) => {
  const activeFlowers = friend.flowers.filter(f => !f.harvestedAt);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-lg text-white font-bold">
          {friend.displayName ? friend.displayName.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <div className="font-medium dark:text-gray-200">{friend.displayName || 'Игрок'}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Код: {friend.inviteCode}</div>
        </div>
      </div>

      {activeFlowers.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {activeFlowers.slice(0, 6).map((flower) => (
            <FriendFlowerItem
              key={flower.id}
              flower={flower}
              ownerId={friend.uid}
              currentUserId={currentUserId}
              onHelp={onHelp}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">
          Нет растущих цветов
        </div>
      )}
    </div>
  );
};

const FriendFlowerItem = ({
  flower,
  ownerId,
  currentUserId,
  onHelp,
}: {
  flower: Flower;
  ownerId: string;
  currentUserId: string;
  onHelp: (flowerId: string, ownerId: string) => void;
}) => {
  const { isReady, formattedTime } = useFlowerTimer(flower.plantedAt, flower.type);
  const hasHelped = flower.helperIds.includes(currentUserId);
  const [isWatering, setIsWatering] = useState(false);

  const handleHelp = () => {
    setIsWatering(true);
    setTimeout(() => {
      onHelp(flower.id, ownerId);
      setIsWatering(false);
    }, 500);
  };

  return (
    <div className={`relative text-center p-2 rounded-lg transition-all ${
      isReady ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'
    } ${isWatering ? 'scale-95' : ''}`}>
      <div className={`text-3xl ${isWatering ? 'animate-water' : ''}`}>
        {getFlowerEmoji(flower.type)}
      </div>
      
      {isWatering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute text-2xl animate-water">💧</span>
          <span className="absolute left-2 text-xl animate-water" style={{ animationDelay: '0.1s' }}>💧</span>
          <span className="absolute right-2 text-xl animate-water" style={{ animationDelay: '0.2s' }}>💧</span>
        </div>
      )}
      
      {isReady ? (
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">✨</div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</div>
      )}
      
      {isReady && !hasHelped && !isWatering && (
        <button
          onClick={handleHelp}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
        >
          💧
        </button>
      )}
      
      {hasHelped && (
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full text-xs flex items-center justify-center shadow">
          ✓
        </div>
      )}
    </div>
  );
};

const Friends = ({ currentUser, onHelp }: FriendsProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const { friends, loading, addFriendByCode, removeFriendById } = useFriends(currentUser);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddFriend = async () => {
    if (!inviteCode.trim()) return;

    const result = await addFriendByCode(inviteCode);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    setInviteCode('');
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemoveFriend = async (friendUid: string) => {
    if (confirm('Удалить этого друга?')) {
      const result = await removeFriendById(friendUid);
      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const copyInviteCode = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.inviteCode);
      setMessage({ type: 'success', text: 'Код скопирован!' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-4xl animate-bounce">👥</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm animate-toast-in ${
          message.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">👥 Друзья</h2>
        <p className="opacity-90 text-sm">Добавляйте друзей и помогайте поливать их цветы!</p>
        
        <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">Ваш код приглашения</div>
            <div className="font-bold text-2xl tracking-wider">{currentUser?.inviteCode}</div>
          </div>
          <button
            onClick={copyInviteCode}
            className="bg-white/30 hover:bg-white/40 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            📋 Копировать
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
        <h3 className="font-semibold mb-3 dark:text-gray-200">Добавить друга</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="FLO-XXXX-XXXX"
            className="flex-1 border rounded-lg px-4 py-3 uppercase tracking-wider text-center font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            maxLength={13}
          />
          <button
            onClick={handleAddFriend}
            disabled={!inviteCode.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➕
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Ваши друзья ({friends.length})</h3>
        
        {friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.uid} className="animate-plant">
                <FriendGarden
                  friend={friend}
                  onHelp={onHelp}
                  currentUserId={currentUser?.uid || ''}
                />
                <button
                  onClick={() => handleRemoveFriend(friend.uid)}
                  className="mt-2 text-sm text-red-400 hover:text-red-500 transition-colors"
                >
                  Удалить из друзей
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <div className="text-5xl mb-4 opacity-50">👥</div>
            <p className="text-lg dark:text-gray-200">У вас пока нет друзей</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Поделитесь своим кодом с друзьями!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
