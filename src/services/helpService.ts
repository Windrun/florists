import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, runTransaction } from 'firebase/firestore';

export interface HelpRequest {
  id: string;
  flowerId: string;
  ownerId: string;
  flowerType: string;
  expiresAt: number;
}

export const getHelpRequests = async (): Promise<HelpRequest[]> => {
  return [];
};

export const helpFlower = async (
  helperId: string,
  ownerId: string,
  flowerId: string
): Promise<{ success: boolean; reward: number }> => {
  const ownerRef = doc(db, 'users', ownerId);
  const helperRef = doc(db, 'users', helperId);

  try {
    await runTransaction(db, async (transaction) => {
      const ownerSnap = await transaction.get(ownerRef);
      if (!ownerSnap.exists()) throw new Error('Owner not found');

      const flowers = ownerSnap.data().flowers || [];
      const flowerIndex = flowers.findIndex((f: { id: string }) => f.id === flowerId);
      
      if (flowerIndex === -1) throw new Error('Flower not found');
      
      const flower = flowers[flowerIndex];
      if (flower.helperIds?.includes(helperId)) {
        throw new Error('Already helped');
      }

      flowers[flowerIndex] = {
        ...flower,
        helperIds: [...(flower.helperIds || []), helperId],
      };

      transaction.update(ownerRef, { flowers });

      const helperSnap = await transaction.get(helperRef);
      if (helperSnap.exists()) {
        const helperCoins = helperSnap.data().coins || 0;
        transaction.update(helperRef, { coins: helperCoins + 1 });
      }
    });

    return { success: true, reward: 1 };
  } catch {
    return { success: false, reward: 0 };
  }
};

export const sendHelpRequest = async (
  ownerId: string,
  flowerId: string,
  flowerType: string
): Promise<string> => {
  return '';
};
