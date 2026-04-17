import { useState, useEffect, useRef } from 'react';
import { Flower } from '../types';
import FlowerComponent from './Flower';
import { useNotifications } from '../hooks/useNotifications';

interface GardenProps {
  flowers: Flower[];
  userId: string;
  onPlant: (type: string) => void;
  onHarvest: (flowerId: string) => void;
  onHelp: (flowerId: string) => void;
  onFlowerReady?: () => void;
  onSpeedUp?: (flowerId: string) => void;
}

const Garden = ({ flowers, userId, onPlant, onHarvest, onHelp, onFlowerReady, onSpeedUp }: GardenProps) => {
  const [showPlantMenu, setShowPlantMenu] = useState(false);
  const [newFlowerId, setNewFlowerId] = useState<string | null>(null);
  const prevFlowersRef = useRef<string[]>([]);
  const notifiedFlowersRef = useRef<Set<string>>(new Set());
  const { requestPermission, hasPermission, playSound } = useNotifications();

  const activeFlowers = flowers.filter((f) => !f.harvestedAt);
  const harvestedFlowers = flowers.filter((f) => f.harvestedAt);
  const availableSlots = 6 - activeFlowers.length;

  const flowerTypes = [
    { type: 'daisy', name: 'Ромашка', time: '1ч', emoji: '🌼', reward: 10 },
    { type: 'rose', name: 'Роза', time: '2ч', emoji: '🌹', reward: 15 },
    { type: 'tulip', name: 'Тюльпан', time: '3ч', emoji: '🌷', reward: 20 },
  ];

  useEffect(() => {
    const currentIds = flowers.map(f => f.id);
    const prevIds = prevFlowersRef.current;
    
    const newId = currentIds.find(id => !prevIds.includes(id));
    if (newId) {
      setNewFlowerId(newId);
      setTimeout(() => setNewFlowerId(null), 500);
    }
    
    prevFlowersRef.current = currentIds;
  }, [flowers]);

  useEffect(() => {
    const checkReadyFlowers = () => {
      const now = Date.now();
      activeFlowers.forEach(flower => {
        if (!notifiedFlowersRef.current.has(flower.id)) {
          const growthTime = flower.type === 'daisy' ? 3600 : flower.type === 'rose' ? 7200 : 10800;
          const elapsed = (now - flower.plantedAt) / 1000;
          
          if (elapsed >= growthTime) {
            notifiedFlowersRef.current.add(flower.id);
            if (onFlowerReady) {
              onFlowerReady();
            }
          }
        }
      });
    };

    checkReadyFlowers();
    const interval = setInterval(checkReadyFlowers, 5000);
    
    return () => clearInterval(interval);
  }, [activeFlowers, onFlowerReady]);

  const handlePlant = (type: string) => {
    onPlant(type);
    setShowPlantMenu(false);
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
    playSound();
  };

  return (
    <div className="pb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">🌱 Мой сад</h2>
        <div className="flex gap-2">
          {!hasPermission && activeFlowers.length > 0 && (
            <button
              onClick={handleEnableNotifications}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1"
            >
              🔔 Включить уведомления
            </button>
          )}
          {availableSlots > 0 && (
            <button
              onClick={() => setShowPlantMenu(!showPlantMenu)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-md"
            >
              + Посадить ({availableSlots})
            </button>
          )}
        </div>
      </div>

      {showPlantMenu && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-100 dark:border-gray-700 animate-plant">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Выберите цветок:</h3>
          <div className="grid grid-cols-3 gap-3">
            {flowerTypes.map((flower) => (
              <button
                key={flower.type}
                onClick={() => handlePlant(flower.type)}
                className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 border border-gray-200 dark:border-gray-600 hover:border-green-400 rounded-xl transition-all text-center transform hover:scale-105 hover:shadow-md active:scale-95"
              >
                <div className="text-4xl mb-1">{flower.emoji}</div>
                <div className="font-medium text-sm dark:text-gray-200">{flower.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{flower.time}</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">+{flower.reward}🪙</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFlowers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Растущие цветы</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeFlowers.map((flower) => (
              <FlowerComponent
                key={flower.id}
                flower={flower}
                currentUserId={userId}
                onHarvest={onHarvest}
                onHelp={onHelp}
                onSpeedUp={onSpeedUp}
                isNew={newFlowerId === flower.id}
              />
            ))}
          </div>
        </div>
      )}

      {harvestedFlowers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Собранные</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {harvestedFlowers.map((flower) => (
              <FlowerComponent
                key={flower.id}
                flower={flower}
                currentUserId={userId}
                onHarvest={onHarvest}
                onHelp={onHelp}
                onSpeedUp={onSpeedUp}
              />
            ))}
          </div>
        </div>
      )}

      {flowers.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Ваш сад пуст</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Посадите первый цветок, чтобы начать!
          </p>
        </div>
      )}
    </div>
  );
};

export default Garden;
