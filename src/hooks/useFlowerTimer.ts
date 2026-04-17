import { useEffect, useState, useCallback } from 'react';
import { getGrowthTime } from '../utils/timeUtils';

interface UseFlowerTimerResult {
  timeRemaining: number;
  isReady: boolean;
  formattedTime: string;
}

export const useFlowerTimer = (plantedAt: number, flowerType: string): UseFlowerTimerResult => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const calculateTimeRemaining = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - plantedAt) / 1000;
    const growthTime = getGrowthTime(flowerType);
    const remaining = growthTime - elapsed;
    return Math.max(0, Math.floor(remaining));
  }, [plantedAt, flowerType]);

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    }
    return `${secs}с`;
  };

  return {
    timeRemaining,
    isReady: timeRemaining <= 0,
    formattedTime: formatTime(timeRemaining),
  };
};
