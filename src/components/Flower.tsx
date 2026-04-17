import { useState, useEffect } from 'react';
import { Flower } from '../types';
import { useFlowerTimer } from '../hooks/useFlowerTimer';

interface FlowerComponentProps {
  flower: Flower;
  currentUserId: string;
  onHarvest: (flowerId: string) => void;
  onHelp: (flowerId: string) => void;
  onSpeedUp?: (flowerId: string) => void;
  isNew?: boolean;
}

const FlowerComponent = ({
  flower,
  currentUserId,
  onHarvest,
  onHelp,
  onSpeedUp,
  isNew = false,
}: FlowerComponentProps) => {
  const { timeRemaining, isReady, formattedTime } = useFlowerTimer(
    flower.plantedAt,
    flower.type
  );
  
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [justGrew, setJustGrew] = useState(false);
  
  const isOwner = flower.ownerId === currentUserId;
  const isHarvested = flower.harvestedAt !== null;
  const hasBeenHelped = flower.helperIds.includes(currentUserId);

  useEffect(() => {
    if (isReady && !isHarvested) {
      setJustGrew(true);
      const timer = setTimeout(() => setJustGrew(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isReady, isHarvested]);

  const getFlowerEmoji = (type: string) => {
    switch (type) {
      case 'daisy':
        return '🌼';
      case 'rose':
        return '🌹';
      case 'tulip':
        return '🌷';
      default:
        return '🌸';
    }
  };

  const getFlowerName = (type: string) => {
    switch (type) {
      case 'daisy':
        return 'Ромашка';
      case 'rose':
        return 'Роза';
      case 'tulip':
        return 'Тюльпан';
      default:
        return 'Цветок';
    }
  };

  const handleHarvest = () => {
    setIsHarvesting(true);
    setShowCoins(true);
    setTimeout(() => {
      onHarvest(flower.id);
    }, 400);
  };

  return (
    <div
      className={`border rounded-xl p-4 text-center transition-all duration-300 relative overflow-hidden dark:border-gray-700 ${
        isNew
          ? 'animate-plant'
          : isReady && !isHarvested
          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 animate-ready'
          : !isReady && !isHarvested
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-pulse-grow'
          : isHarvested
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      {showCoins && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute animate-coin text-2xl">🪙</span>
          <span className="absolute left-1/3 animate-coin text-2xl" style={{ animationDelay: '0.1s' }}>🪙</span>
          <span className="absolute right-1/3 animate-coin text-2xl" style={{ animationDelay: '0.2s' }}>🪙</span>
        </div>
      )}

      <div className={`${isHarvesting ? 'animate-harvest' : ''} ${justGrew ? 'animate-ready-bounce' : ''}`}>
        <div className="text-5xl mb-2">{getFlowerEmoji(flower.type)}</div>
        <div className="font-medium text-gray-800 dark:text-gray-200">{getFlowerName(flower.type)}</div>
      </div>

      {flower.potSkin !== 'default' && (
        <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">✨ {flower.potSkin}</div>
      )}

      {isHarvested ? (
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">Собран ✓</div>
      ) : isReady ? (
        <>
          <div className={`text-sm font-medium mt-2 ${justGrew ? 'text-green-600 dark:text-green-400 animate-xp' : 'text-green-600 dark:text-green-400'}`}>
            ✨ Готов к сбору!
          </div>
          {isOwner && (
            <button
              onClick={handleHarvest}
              disabled={isHarvesting}
              className="mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              🪙 Собрать
            </button>
          )}
          {!isOwner && (
            <div className="text-sm text-green-500 dark:text-green-400 mt-2">Ожидает сбора</div>
          )}
        </>
      ) : (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span className="inline-block animate-pulse">⏳</span> {formattedTime}
          </div>
          {isOwner && onSpeedUp && (
            <button
              onClick={() => onSpeedUp(flower.id)}
              className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 mx-auto"
            >
              ⚡ 5💎 Ускорить
            </button>
          )}
          {!isOwner && !hasBeenHelped && (
            <button
              onClick={() => onHelp(flower.id)}
              className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              💧 Помочь
            </button>
          )}
          {!isOwner && hasBeenHelped && (
            <div className="text-sm text-blue-400 mt-2 animate-pulse">✓ Помогли</div>
          )}
        </>
      )}

      {flower.helperIds.length > 0 && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
          <span className="inline-block animate-pulse">👥</span> {flower.helperIds.length}
        </div>
      )}
    </div>
  );
};

export default FlowerComponent;
