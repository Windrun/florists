import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Flower } from '../types';

export const SPEED_UP_COST = 5;

export const speedUpFlower = async (
  userId: string,
  flowerId: string
): Promise<{ success: boolean; message: string }> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { success: false, message: 'User not found' };
  }
  
  const userData = userSnap.data();
  
  if (userData.gems < SPEED_UP_COST) {
    return { success: false, message: `Need ${SPEED_UP_COST}💎` };
  }
  
  const flowers: Flower[] = userData.flowers || [];
  const flowerIndex = flowers.findIndex(f => f.id === flowerId);
  
  if (flowerIndex === -1) {
    return { success: false, message: 'Flower not found' };
  }
  
  const flower = flowers[flowerIndex];
  
  if (flower.harvestedAt !== null) {
    return { success: false, message: 'Already harvested' };
  }
  
  const growthTime = flower.type === 'daisy' ? 3600 : flower.type === 'rose' ? 7200 : 10800;
  const timePlanted = Date.now() - flower.plantedAt;
  const timeToGrow = growthTime - timePlanted;
  
  if (timeToGrow <= 0) {
    return { success: false, message: 'Already ready' };
  }
  
  flowers[flowerIndex] = {
    ...flower,
    plantedAt: flower.plantedAt - timeToGrow,
  };
  
  await updateDoc(userRef, {
    flowers,
    gems: userData.gems - SPEED_UP_COST,
  });
  
  return { success: true, message: 'Speed up!' };
};