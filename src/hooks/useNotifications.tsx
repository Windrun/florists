import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  playSound: () => void;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  requestPermission: async () => false,
  sendNotification: () => {},
  playSound: () => {},
  hasPermission: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      const ctx = audioContextRef.current;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(523, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Sound not supported');
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') return false;
    
    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }
    
    return false;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof Notification === 'undefined') return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '🌸',
        badge: '🌸',
        tag: 'florists-ready',
        ...options,
      });
    }
    
    playSound();
  }, [playSound]);

  return (
    <NotificationContext.Provider value={{ requestPermission, sendNotification, playSound, hasPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
