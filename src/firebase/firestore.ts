import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { AuctionListing } from '../types';

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

export const createAuction = async (listing: Omit<AuctionListing, 'id'>): Promise<string> => {
  const auctionsRef = collection(db, 'auctions');
  const docRef = await addDoc(auctionsRef, listing);
  return docRef.id;
};

export const purchaseAuction = async (auctionId: string, buyerId: string, price: number): Promise<boolean> => {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);
  
  if (!auctionSnap.exists()) return false;
  
  const auction = auctionSnap.data() as AuctionListing;
  if (auction.status !== 'active') return false;
  if (auction.sellerId === buyerId) return false;
  
  await updateDoc(auctionRef, {
    status: 'sold',
    buyerId,
  });
  
  return true;
};

export const cancelAuction = async (auctionId: string, sellerId: string): Promise<boolean> => {
  const auctionRef = doc(db, 'auctions', auctionId);
  const auctionSnap = await getDoc(auctionRef);
  
  if (!auctionSnap.exists()) return false;
  
  const auction = auctionSnap.data() as AuctionListing;
  if (auction.sellerId !== sellerId) return false;
  if (auction.status !== 'active') return false;
  
  await updateDoc(auctionRef, { status: 'expired' });
  return true;
};
