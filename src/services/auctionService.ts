import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  limit,
} from 'firebase/firestore';
import { AuctionListing, FlowerType } from '../types';

const AUCTION_DURATION = 24 * 60 * 60 * 1000;

export const getActiveAuctions = async (): Promise<AuctionListing[]> => {
  const auctionsRef = collection(db, 'auctions');
  const q = query(
    auctionsRef,
    where('status', '==', 'active'),
    orderBy('expiresAt', 'asc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
};

export const getUserAuctions = async (userId: string): Promise<AuctionListing[]> => {
  const auctionsRef = collection(db, 'auctions');
  const q = query(
    auctionsRef,
    where('sellerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
};

export const createAuction = async (
  sellerId: string,
  flowerId: string,
  flowerType: FlowerType,
  potSkin: string,
  price: number
): Promise<string> => {
  const auctionsRef = collection(db, 'auctions');
  const now = Date.now();
  
  const listing: Omit<AuctionListing, 'id'> = {
    sellerId,
    flowerId,
    flowerType,
    potSkin,
    price,
    createdAt: now,
    expiresAt: now + AUCTION_DURATION,
    status: 'active',
  };

  const docRef = await addDoc(auctionsRef, listing);
  return docRef.id;
};

export const purchaseAuction = async (
  auctionId: string,
  buyerId: string,
  buyerCoins: number
): Promise<{ success: boolean; message: string }> => {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);
  
  if (!auctionSnap.exists()) {
    return { success: false, message: 'Аукцион не найден' };
  }
  
  const auction = auctionSnap.data() as AuctionListing;
  
  if (auction.status !== 'active') {
    return { success: false, message: 'Аукцион уже завершён' };
  }
  
  if (auction.sellerId === buyerId) {
    return { success: false, message: 'Нельзя купить свой товар' };
  }
  
  if (auction.expiresAt < Date.now()) {
    return { success: false, message: 'Аукцион истёк' };
  }
  
  if (buyerCoins < auction.price) {
    return { success: false, message: 'Недостаточно монет' };
  }

  const sellerRef = doc(db, 'users', auction.sellerId);
  const buyerRef = doc(db, 'users', buyerId);
  
  await updateDoc(auctionRef, {
    status: 'sold',
    buyerId,
  });
  
  await updateDoc(buyerRef, {
    coins: buyerCoins - auction.price,
  });
  
  const sellerSnap = await getDoc(sellerRef);
  if (sellerSnap.exists()) {
    const sellerCoins = sellerSnap.data().coins || 0;
    await updateDoc(sellerRef, { coins: sellerCoins + auction.price });
  }
  
  return { success: true, message: 'Покупка успешна!' };
};

export const cancelAuction = async (
  auctionId: string,
  sellerId: string
): Promise<{ success: boolean; message: string }> => {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);
  
  if (!auctionSnap.exists()) {
    return { success: false, message: 'Аукцион не найден' };
  }
  
  const auction = auctionSnap.data() as AuctionListing;
  
  if (auction.sellerId !== sellerId) {
    return { success: false, message: 'Это не ваш аукцион' };
  }
  
  if (auction.status !== 'active') {
    return { success: false, message: 'Аукцион уже завершён' };
  }
  
  await updateDoc(auctionRef, { status: 'expired' });
  return { success: true, message: 'Аукцион отменён' };
};
