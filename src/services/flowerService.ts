import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, runTransaction, increment, getDoc } from 'firebase/firestore';
import { Flower, FlowerType } from '../types';
import { isFlowerReady, getFlowerReward as getRewardFromTime } from '../utils/timeUtils';
import { getFlowerReward } from '../utils/flowerConfigs';
import { ENERGY_CONFIG, calculateEnergy } from '../utils/energyUtils';

export const plantFlower = async (userId: string, flowerType: string, potSkin: string = 'default') => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('Пользователь не найден');
  }
  
  const userData = userSnap.data();
  const currentEnergy = userData.energy || ENERGY_CONFIG.maxEnergy;
  const lastEnergyRefill = userData.lastEnergyRefill || Date.now();
  
  const currentEnergyWithRefill = calculateEnergy(currentEnergy, lastEnergyRefill);
  
  if (currentEnergyWithRefill < ENERGY_CONFIG.energyPerPlant) {
    throw new Error('Недостаточно энергии');
  }
  
  const newFlower: Flower = {
    id: `${Date.now()}_${Math.random()}`,
    type: flowerType as FlowerType,
    plantedAt: Date.now(),
    harvestedAt: null,
    helperIds: [],
    ownerId: userId,
    potSkin,
  };

  const newEnergy = currentEnergyWithRefill - ENERGY_CONFIG.energyPerPlant;

  await updateDoc(userRef, {
    flowers: arrayUnion(newFlower),
    energy: newEnergy,
    lastEnergyRefill: Date.now(),
  });

  return newFlower;
};

export const harvestFlower = async (userId: string, flowerId: string) => {
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const flowers: Flower[] = userData.flowers || [];

    const flowerIndex = flowers.findIndex(f => f.id === flowerId);
    if (flowerIndex === -1) return;

    const flower = flowers[flowerIndex];
    if (!isFlowerReady(flower.plantedAt, flower.type)) {
      throw new Error('Цветок еще не вырос');
    }
    if (flower.harvestedAt !== null) {
      throw new Error('Цветок уже собран');
    }

    flowers[flowerIndex] = { ...flower, harvestedAt: Date.now() };

    const reward = getFlowerReward(flower.type as FlowerType);
    const newCoins = (userData.coins || 0) + reward;

    transaction.update(userRef, {
      flowers,
      coins: newCoins,
    });
  });
};

export const helpFlower = async (helperId: string, flowerOwnerId: string, flowerId: string) => {
  const ownerRef = doc(db, 'users', flowerOwnerId);

  await runTransaction(db, async (transaction) => {
    const ownerSnap = await transaction.get(ownerRef);
    if (!ownerSnap.exists()) return;

    const ownerData = ownerSnap.data();
    const flowers: Flower[] = ownerData.flowers || [];

    const flowerIndex = flowers.findIndex(f => f.id === flowerId);
    if (flowerIndex === -1) return;

    const flower = flowers[flowerIndex];
    if (flower.helperIds.includes(helperId)) {
      throw new Error('Вы уже помогали этому цветку');
    }
    if (flower.harvestedAt !== null) {
      throw new Error('Цветок уже собран');
    }

    flowers[flowerIndex] = {
      ...flower,
      helperIds: [...flower.helperIds, helperId],
    };

    transaction.update(ownerRef, { flowers });

    const helperRef = doc(db, 'users', helperId);
    const helperSnap = await transaction.get(helperRef);
    if (helperSnap.exists()) {
      const helperData = helperSnap.data();
      const helperCurrentEnergy = helperData.energy || ENERGY_CONFIG.maxEnergy;
      const helperLastRefill = helperData.lastEnergyRefill || Date.now();
      const helperEnergy = calculateEnergy(helperCurrentEnergy, helperLastRefill);
      const newHelperEnergy = Math.min(helperEnergy + ENERGY_CONFIG.energyGainPerHelp, ENERGY_CONFIG.maxEnergy);
      
      const helperCoins = helperData.coins || 0;
      transaction.update(helperRef, { 
        coins: helperCoins + 1,
        energy: newHelperEnergy,
        lastEnergyRefill: Date.now(),
      });
    }
  });
};

export const getAvailableFlowersForHelp = async (_userId: string): Promise<Array<{ ownerId: string; flower: Flower }>> => {
  return [];
};
