import { useState, useEffect } from 'react';
import { User, AuctionListing } from '../types';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, runTransaction } from 'firebase/firestore';
import AuctionItem from './AuctionItem';

interface AuctionProps {
  userData: User | null;
  onRefresh?: () => void;
}

const Auction = ({ userData, onRefresh }: AuctionProps) => {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [myListings, setMyListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [showSellForm, setShowSellForm] = useState(false);
  const [sellFlowerId, setSellFlowerId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState(10);

  const loadAuctions = async () => {
    if (!userData) return;

    try {
      const activeQuery = query(
        collection(db, 'auctions'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const activeSnap = await getDocs(activeQuery);
      const activeListings = activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuctionListing[];
      setListings(activeListings);

      const myQuery = query(
        collection(db, 'auctions'),
        where('sellerId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );
      const mySnap = await getDocs(myQuery);
      const myListingsData = mySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuctionListing[];
      setMyListings(myListingsData);
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [userData]);

  const handleSell = async () => {
    if (!userData || !sellFlowerId) return;

    const flower = userData.flowers.find(f => f.id === sellFlowerId);
    if (!flower || flower.harvestedAt) {
      alert('Этот цветок нельзя продать');
      return;
    }

    try {
      const auctionRef = collection(db, 'auctions');
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      await addDoc(auctionRef, {
        sellerId: userData.uid,
        flowerId: flower.id,
        flowerType: flower.type,
        potSkin: flower.potSkin,
        price: sellPrice,
        createdAt: Date.now(),
        expiresAt,
        status: 'active',
      });

      const userRef = doc(db, 'users', userData.uid);
      const updatedFlowers = userData.flowers.filter(f => f.id !== sellFlowerId);
      await updateDoc(userRef, { flowers: updatedFlowers });

      setShowSellForm(false);
      setSellFlowerId(null);
      if (onRefresh) onRefresh();
      loadAuctions();
      alert('Цветок выставлен на аукцион!');
    } catch (error) {
      console.error('Error selling flower:', error);
      alert('Ошибка при выставлении');
    }
  };

  const handleBuy = async (listing: AuctionListing) => {
    if (!userData) return;
    if (userData.coins < listing.price) {
      alert('Недостаточно монет');
      return;
    }

    try {
      const listingRef = doc(db, 'auctions', listing.id);
      const buyerRef = doc(db, 'users', userData.uid);
      const sellerRef = doc(db, 'users', listing.sellerId);

      await runTransaction(db, async (transaction) => {
        const listingSnap = await transaction.get(listingRef);
        if (!listingSnap.exists() || listingSnap.data().status !== 'active') {
          throw new Error('Лот больше не доступен');
        }

        const buyerSnap = await transaction.get(buyerRef);
        const sellerSnap = await transaction.get(sellerRef);

        if (!buyerSnap.exists() || !sellerSnap.exists()) return;

        const buyerCoins = buyerSnap.data().coins || 0;
        if (buyerCoins < listing.price) {
          throw new Error('Недостаточно монет');
        }

        const newFlower = {
          id: `${Date.now()}_${Math.random()}`,
          type: listing.flowerType,
          plantedAt: Date.now(),
          harvestedAt: null,
          helperIds: [],
          ownerId: userData.uid,
          potSkin: listing.potSkin,
        };

        const buyerFlowers = [...(buyerSnap.data().flowers || []), newFlower];

        transaction.update(buyerRef, {
          coins: buyerCoins - listing.price,
          flowers: buyerFlowers,
        });

        const sellerCoins = sellerSnap.data().coins || 0;
        transaction.update(sellerRef, {
          coins: sellerCoins + listing.price,
        });

        transaction.update(listingRef, {
          status: 'sold',
          buyerId: userData.uid,
        });
      });

      if (onRefresh) onRefresh();
      loadAuctions();
      alert('Покупка успешна! Цветок добавлен в ваш сад.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при покупке';
      alert(message);
    }
  };

  const harvestableFlowers = userData?.flowers.filter(
    f => !f.harvestedAt && !f.helperIds?.length
  ) || [];

  if (loading) {
    return <div className="text-center py-8 dark:text-gray-300">Загрузка аукциона...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowSellForm(!showSellForm)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          {showSellForm ? 'Отмена' : '➕ Выставить цветок'}
        </button>
      </div>

      {showSellForm && (
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm dark:border-gray-700">
          <h3 className="font-bold mb-3 dark:text-gray-200">Выставить на аукцион</h3>
          <div className="space-y-3">
            <select
              value={sellFlowerId || ''}
              onChange={(e) => setSellFlowerId(e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="">Выберите цветок</option>
              {harvestableFlowers.map((flower) => (
                <option key={flower.id} value={flower.id}>
                  {flower.type === 'daisy' && '🌼 Ромашка'}
                  {flower.type === 'rose' && '🌹 Роза'}
                  {flower.type === 'tulip' && '🌷 Тюльпан'}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(Number(e.target.value))}
              placeholder="Цена в монетах"
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              min={1}
            />
            <button
              onClick={handleSell}
              disabled={!sellFlowerId || sellPrice < 1}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Выставить
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Все лоты
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`pb-2 px-1 ${activeTab === 'mine' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Мои лоты
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'all' ? listings : myListings).map((listing) => (
          <AuctionItem
            key={listing.id}
            listing={listing}
            currentUserId={userData?.uid}
            onBuy={() => handleBuy(listing)}
          />
        ))}
      </div>

      {((activeTab === 'all' && listings.length === 0) ||
        (activeTab === 'mine' && myListings.length === 0)) && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {activeTab === 'all' ? 'Нет активных лотов' : 'Вы еще не выставляли цветы'}
        </div>
      )}
    </div>
  );
};

export default Auction;
