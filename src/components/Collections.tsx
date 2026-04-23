import { User } from '../types';
import { POT_COLLECTIONS, FLOWER_COLLECTIONS, Collection, checkCollectionComplete, getCollectionProgress } from '../utils/collections';
import { useToast } from '../App';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CollectionsProps {
  user: User | null;
}

const Collections = ({ user }: CollectionsProps) => {
  const { showToast } = useToast();
  
  if (!user) return null;

  const handleClaimBonus = async (collection: Collection, bonusType: 'pots' | 'flowers') => {
    if (!user) return;
    
    const owned = bonusType === 'pots' ? user.ownedPotSkins : user.ownedFlowerSeeds;
    if (!checkCollectionComplete(owned, collection)) {
      showToast('Соберите все предметы коллекции!', 'error');
      return;
    }

    const claimedKey = `collection_${bonusType}_${collection.id}`;
    const claimed = localStorage.getItem(claimedKey);
    
    if (claimed) {
      showToast('Бонус уже получен!', 'error');
      return;
    }

    localStorage.setItem(claimedKey, 'true');
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    if (collection.bonus.type === 'coins') {
      await updateDoc(userRef, { coins: (userData?.coins || 0) + collection.bonus.amount });
    } else if (collection.bonus.type === 'gems') {
      await updateDoc(userRef, { gems: (userData?.gems || 0) + collection.bonus.amount });
    }
    
    let message = '';
    if (collection.bonus.type === 'coins') {
      message = `+${collection.bonus.amount}🪙`;
    } else if (collection.bonus.type === 'gems') {
      message = `+${collection.bonus.amount}💎`;
    } else {
      message = `+${collection.bonus.amount} XP`;
    }
    
    showToast(`🎉 ${collection.name}: ${message}!`, 'success');
  };

  const renderCollection = (collection: Collection, type: 'pots' | 'flowers') => {
    const owned = type === 'pots' ? user.ownedPotSkins : user.ownedFlowerSeeds;
    const isComplete = checkCollectionComplete(owned, collection);
    const progress = getCollectionProgress(owned, collection);
    const claimedKey = `collection_${type}_${collection.id}`;
    const claimed = !!localStorage.getItem(claimedKey);

    return (
      <div
        key={collection.id}
        className={`p-3 rounded-lg border ${
          claimed
            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
            : isComplete
            ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{collection.icon}</span>
          <div className="flex-1">
            <div className="font-medium dark:text-gray-200">{collection.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{collection.description}</div>
          </div>
          {isComplete && !claimed && (
            <button
              onClick={() => handleClaimBonus(collection, type)}
              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
            >
              Бонус
            </button>
          )}
          {claimed && <span className="text-xs text-green-500">✓</span>}
        </div>
        <div className="flex gap-1">
          {collection.items.map(item => (
            <div
              key={item}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                owned.includes(item)
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-gray-200 dark:bg-gray-600 opacity-50'
              }`}
            >
              {owned.includes(item) ? '✓' : '🔒'}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {progress} / {collection.items.length}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📦</span>
        <h3 className="font-bold dark:text-gray-200">Коллекции</h3>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Горшки</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {POT_COLLECTIONS.map(c => renderCollection(c, 'pots'))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Цветы</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FLOWER_COLLECTIONS.map(c => renderCollection(c, 'flowers'))}
        </div>
      </div>
    </div>
  );
};

export default Collections;