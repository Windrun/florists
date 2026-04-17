import { useEffect, useState } from 'react';
import { AuctionListing } from '../types';
import { formatTime } from '../utils/timeUtils';

interface AuctionItemProps {
  listing: AuctionListing;
  currentUserId?: string;
  onBuy: () => void;
}

const AuctionItem = ({ listing, currentUserId, onBuy }: AuctionItemProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const isOwner = listing.sellerId === currentUserId;

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((listing.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [listing.expiresAt]);

  const getFlowerEmoji = (type: string) => {
    switch (type) {
      case 'daisy': return '🌼';
      case 'rose': return '🌹';
      case 'tulip': return '🌷';
      default: return '🌸';
    }
  };

  const getFlowerName = (type: string) => {
    switch (type) {
      case 'daisy': return 'Ромашка';
      case 'rose': return 'Роза';
      case 'tulip': return 'Тюльпан';
      default: return 'Цветок';
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className={`border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700 ${isExpired ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="text-4xl">{getFlowerEmoji(listing.flowerType)}</div>
        <div className="flex-1">
          <div className="font-bold dark:text-gray-200">{getFlowerName(listing.flowerType)}</div>
          {listing.potSkin !== 'default' && (
            <div className="text-xs text-purple-500 dark:text-purple-400">✨ особый горшок</div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Продавец: {listing.sellerId.slice(0, 8)}...
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{listing.price} 🪙</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {isExpired ? (
          <span className="text-red-500">Лот истек</span>
        ) : (
          <span>⏳ Осталось: {formatTime(timeLeft)}</span>
        )}
      </div>

      {!isOwner && !isExpired && (
        <button
          onClick={onBuy}
          className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          Купить
        </button>
      )}

      {isOwner && !isExpired && (
        <div className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500">
          Ваш лот ожидает покупателя
        </div>
      )}

      {listing.status === 'sold' && (
        <div className="mt-3 text-center text-sm text-blue-500">
          ✅ Продан
        </div>
      )}
    </div>
  );
};

export default AuctionItem;
