import { useState, createContext, useContext, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import Layout from './components/Layout';
import Garden from './components/Garden';
import Shop from './components/Shop';
import Auction from './components/Auction';
import BattlePass from './components/BattlePass';
import Friends from './components/Friends';
import DailyRewards from './components/DailyRewards';
import DailyTasks from './components/DailyTasks';
import Leaderboard from './components/Leaderboard';
import FlowerCollection from './components/FlowerCollection';
import ProfileSettings from './components/ProfileSettings';
import Achievements from './components/Achievements';
import Collections from './components/Collections';
import { NotificationProvider, useNotifications } from './hooks/useNotifications';
import { plantFlower, harvestFlower, helpFlower } from './services/flowerService';
import { addBattlePassExp } from './services/userService';
import { speedUpFlower, SPEED_UP_COST } from './services/speedUpService';
import { updateTaskProgress } from './services/taskService';
import { XP_REWARDS } from './utils/xpUtils';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'xp';
  leaving?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'xp') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'xp' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.map(t => 
        t.id === id ? { ...t, leaving: true } : t
      ));
    }, 2500);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-xl shadow-lg text-white font-medium ${
              toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
            } ${
              toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
          >
            {toast.type === 'xp' && <span className="mr-1">⭐</span>}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading, setUserData } = useUserData(user?.uid);
  const { showToast } = useToast();
  const { sendNotification, requestPermission, hasPermission } = useNotifications();

  const refreshUserData = async () => {
    if (!user?.uid) return;
    const { getUserData } = await import('./services/userService');
    const fresh = await getUserData(user.uid);
    setUserData(fresh);
  };

  const addXp = async (amount: number) => {
    if (!user?.uid) return;
    await addBattlePassExp(user.uid, amount);
  };

  const handlePlant = async (flowerType: string) => {
    if (!user?.uid) return;
    try {
      await plantFlower(user.uid, flowerType);
      await addXp(XP_REWARDS.PLANT_FLOWER);
      await updateTaskProgress(user.uid, 'plant');
      await refreshUserData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      showToast(message, 'error');
    }
  };

  const handleHarvest = async (flowerId: string) => {
    if (!user?.uid) return;
    await harvestFlower(user.uid, flowerId);
    await addXp(XP_REWARDS.HARVEST_FLOWER);
    await updateTaskProgress(user.uid, 'harvest');
    await refreshUserData();
  };

  const handleHelp = async (flowerId: string, ownerId: string) => {
    if (!user?.uid) return;
    try {
      await helpFlower(user.uid, ownerId, flowerId);
      await addXp(XP_REWARDS.HELP_FRIEND);
      await updateTaskProgress(user.uid, 'help');
      await refreshUserData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      showToast(message, 'error');
    }
  };

  const handleSpeedUp = async (flowerId: string) => {
    if (!user?.uid) return;
    const result = await speedUpFlower(user.uid, flowerId);
    if (result.success) {
      showToast(`⚡ Ускорено! -${SPEED_UP_COST}💎`, 'success');
      await refreshUserData();
    } else {
      showToast(result.message, 'error');
    }
  };

  const onFlowerReady = () => {
    sendNotification('🌸 Цветок готов!', {
      body: 'Ваш цветок можно собрать!',
      tag: 'flower-ready',
    });
  };

  if (authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🌱</div>
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout userData={userData} />}>
            <Route
              index
              element={
                <div className="space-y-4">
                  <DailyRewards user={userData} onRefresh={refreshUserData} />
                  <DailyTasks user={userData} onRefresh={refreshUserData} />
                  <Leaderboard />
                  <FlowerCollection user={userData} />
                  <Achievements user={userData} />
                  <Collections user={userData} />
                  <Garden
                    flowers={userData?.flowers || []}
                    userId={user?.uid || ''}
                    userData={userData}
                    onPlant={handlePlant}
                    onHarvest={handleHarvest}
                    onHelp={handleHelp}
                    onFlowerReady={onFlowerReady}
                    onSpeedUp={handleSpeedUp}
                  />
                </div>
              }
            />
            <Route
              path="shop"
              element={<Shop userData={userData} onRefresh={refreshUserData} />}
            />
            <Route
              path="auction"
              element={<Auction userData={userData} onRefresh={refreshUserData} />}
            />
            <Route
              path="battlepass"
              element={<BattlePass userData={userData} onRefresh={refreshUserData} />}
            />
            <Route
              path="friends"
              element={<Friends currentUser={userData} onHelp={handleHelp} />}
            />
            <Route
              path="profile"
              element={<ProfileSettings user={userData} onRefresh={refreshUserData} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
