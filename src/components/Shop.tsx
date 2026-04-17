import { useState, useEffect } from 'react';
import { User, ShopItem } from '../types';
import { db } from '../firebase/config';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { getFlowerEmoji, getFlowerName, getFlowerReward } from '../utils/flowerConfigs';

interface ShopProps {
  userData: User | null;
  onRefresh?: () => void;
}

const Shop = ({ userData, onRefresh }: ShopProps) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      const shopRef = collection(db, 'shop');
      const snapshot = await getDocs(shopRef);
      const shopItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShopItem[];
      setItems(shopItems);
      setLoading(false);
    };
    fetchShop();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    if (!userData) return;

    setPurchasing(item.id);

    try {
      const userRef = doc(db, 'users', userData.uid);

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) return;

        const currentCoins = userSnap.data().coins || 0;
        const currentGems = userSnap.data().gems || 0;

        if (item.priceCoins !== null && currentCoins < item.priceCoins) {
          throw new Error('Недостаточно монет');
        }
        if (item.priceGems > 0 && currentGems < item.priceGems) {
          throw new Error('Недостаточно алмазов');
        }

        const updates: Record<string, unknown> = {};
        if (item.priceCoins !== null) {
          updates.coins = currentCoins - item.priceCoins;
        }
        if (item.priceGems > 0) {
          updates.gems = currentGems - item.priceGems;
        }

        if (item.type === 'pot_skin') {
          const ownedSkins = userSnap.data().ownedPotSkins || [];
          if (!ownedSkins.includes(item.data.skinId)) {
            updates.ownedPotSkins = [...ownedSkins, item.data.skinId];
          }
        }

        if (item.type === 'seed') {
          const ownedSeeds = userSnap.data().ownedFlowerSeeds || [];
          if (!ownedSeeds.includes(item.data.flowerType)) {
            updates.ownedFlowerSeeds = [...ownedSeeds, item.data.flowerType];
          }
        }

        if (item.type === 'gem_pack') {
          updates.gems = currentGems + (item.data.amount || 0);
        }

        transaction.update(userRef, updates);
      });

      if (onRefresh) onRefresh();
      alert('Покупка успешно совершена!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при покупке';
      alert(message);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8 dark:text-gray-300">Загрузка магазина...</div>;
  }

  const potSkins = items.filter(i => i.type === 'pot_skin');
  const seeds = items.filter(i => i.type === 'seed');
  const gemPacks = items.filter(i => i.type === 'gem_pack');

  const isOwned = (item: ShopItem): boolean => {
    if (!userData) return false;
    if (item.type === 'pot_skin') {
      return userData.ownedPotSkins?.includes(item.data.skinId as string) || false;
    }
    if (item.type === 'seed') {
      return userData.ownedFlowerSeeds?.includes(item.data.flowerType as 'daisy' | 'rose' | 'tulip') || false;
    }
    return false;
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>💎</span> Пополнить алмазы
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gemPacks.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700">
              <div className="text-2xl text-center mb-2">💎</div>
              <div className="text-center font-bold text-lg dark:text-gray-200">{item.data.amount} алмазов</div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                {item.priceGems === 0 ? 'Бесплатно' : `${item.priceGems} 💎`}
              </div>
              <button
                onClick={() => handlePurchase(item)}
                disabled={purchasing === item.id}
                className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {purchasing === item.id ? 'Покупка...' : 'Купить'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🏺</span> Скины горшков
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {potSkins.map((item) => {
            const owned = isOwned(item);
            return (
              <div key={item.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm text-center dark:border-gray-700">
                <div className="text-3xl mb-2">
                  {item.data.skinId === 'golden' ? '🏺✨' : '🏺'}
                </div>
                <div className="font-medium dark:text-gray-200">{item.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {item.priceCoins ? `${item.priceCoins} 🪙` : `${item.priceGems} 💎`}
                </div>
                {owned ? (
                  <span className="inline-block w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2 rounded-lg text-sm">
                    Уже есть
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {purchasing === item.id ? '...' : 'Купить'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🌱</span> Новые цветы
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {seeds.map((item) => {
            const owned = isOwned(item);
            const flowerType = item.data.flowerType as keyof typeof import('../utils/flowerConfigs').FLOWER_CONFIGS;
            return (
              <div key={item.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm text-center dark:border-gray-700">
                <div className="text-3xl mb-2">{getFlowerEmoji(flowerType)}</div>
                <div className="font-medium dark:text-gray-200">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.data.growthTime === 3600 ? '1 час' : item.data.growthTime === 7200 ? '2 часа' : item.data.growthTime === 14400 ? '4 часа' : item.data.growthTime === 21600 ? '6 часов' : '3 часа'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {item.priceCoins ? `${item.priceCoins} 🪙` : `${item.priceGems} 💎`}
                </div>
                {owned ? (
                  <span className="inline-block w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-2 rounded-lg text-sm">
                    Уже есть
                  </span>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing === item.id}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    {purchasing === item.id ? '...' : 'Купить'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Shop;
