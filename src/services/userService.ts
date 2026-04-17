import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { User, Friend, DailyReward } from '../types';

const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 10 },
  { day: 2, coins: 15 },
  { day: 3, coins: 20 },
  { day: 4, coins: 25, gems: 1 },
  { day: 5, coins: 30, gems: 2 },
  { day: 6, coins: 40, gems: 3 },
  { day: 7, coins: 100, gems: 10 },
];

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FLO-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const isSameDay = (ts1: number, ts2: number): boolean => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const isConsecutiveDay = (lastReward: number, now: number): boolean => {
  const lastDate = new Date(lastReward);
  const nowDate = new Date(now);
  const diffTime = now - lastReward;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return false;
  if (diffDays === 1) return true;
  
  return false;
};

export const createUserIfNotExists = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const inviteCode = generateInviteCode();
    
    const newUser: Omit<User, 'uid'> = {
      displayName: null,
      photoURL: null,
      coins: 100,
      gems: 0,
      flowers: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      ownedPotSkins: ['default'],
      ownedFlowerSeeds: ['daisy', 'rose', 'tulip'],
      battlePassLevel: 1,
      battlePassExp: 0,
      inviteCode,
      friends: [],
      dailyStreak: 0,
      lastDailyReward: 0,
      totalDailyRewards: 0,
    };
    await setDoc(userRef, newUser);
  } else {
    await updateDoc(userRef, { lastActiveAt: serverTimestamp() });
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { uid, ...userSnap.data() } as User;
};

export const updateUserCoins = async (uid: string, delta: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { coins: increment(delta) });
};

export const updateUserGems = async (uid: string, delta: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { gems: increment(delta) });
};

export const addBattlePassExp = async (uid: string, exp: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { battlePassExp: increment(exp) });
};

export const getDailyRewardStatus = async (uid: string): Promise<{ canClaim: boolean; streak: number }> => {
  const user = await getUserData(uid);
  if (!user) return { canClaim: false, streak: 0 };

  const now = Date.now();
  
  if (user.lastDailyReward === 0) {
    return { canClaim: true, streak: 1 };
  }
  
  if (isSameDay(user.lastDailyReward, now)) {
    return { canClaim: false, streak: user.dailyStreak };
  }
  
  if (isConsecutiveDay(user.lastDailyReward, now)) {
    return { canClaim: true, streak: user.dailyStreak + 1 };
  }
  
  return { canClaim: true, streak: 1 };
};

export const claimDailyReward = async (uid: string): Promise<{ success: boolean; message: string; reward: DailyReward | null }> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { success: false, message: 'User not found', reward: null };
  }

  const userData = userSnap.data() as User;
  const now = Date.now();
  
  if (userData.lastDailyReward > 0 && isSameDay(userData.lastDailyReward, now)) {
    return { success: false, message: 'Already claimed today', reward: null };
  }

  let newStreak: number;
  let reward: DailyReward;
  
  if (userData.lastDailyReward === 0 || !isConsecutiveDay(userData.lastDailyReward, now)) {
    newStreak = 1;
    reward = DAILY_REWARDS[0];
  } else {
    newStreak = Math.min(userData.dailyStreak + 1, 7);
    reward = DAILY_REWARDS[newStreak - 1];
  }

  const updates: Record<string, unknown> = {
    dailyStreak: newStreak,
    lastDailyReward: now,
    totalDailyRewards: increment(1),
    coins: increment(reward.coins),
  };

  if (reward.gems) {
    updates.gems = increment(reward.gems);
  }

  await updateDoc(userRef, updates);

  let rewardText = `+${reward.coins}🪙`;
  if (reward.gems) rewardText += ` +${reward.gems}💎`;

  return { 
    success: true, 
    message: `Day ${newStreak}: ${rewardText}!`,
    reward 
  };
};

export const findUserByInviteCode = async (code: string): Promise<User | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('inviteCode', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const docSnap = snapshot.docs[0];
  return { uid: docSnap.id, ...docSnap.data() } as User;
};

export const addFriend = async (currentUserId: string, friendUid: string, friendData: { displayName: string | null; photoURL: string | null }): Promise<{ success: boolean; message: string }> => {
  if (currentUserId === friendUid) {
    return { success: false, message: 'Нельзя добавить себя' };
  }

  const userRef = doc(db, 'users', currentUserId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { success: false, message: 'Ошибка пользователя' };
  }

  const userData = userSnap.data() as User;
  
  if (userData.friends.some(f => f.uid === friendUid)) {
    return { success: false, message: 'Друг уже добавлен' };
  }

  const newFriend: Friend = {
    uid: friendUid,
    displayName: friendData.displayName,
    photoURL: friendData.photoURL,
    addedAt: Date.now(),
  };

  const updatedFriends = [...userData.friends, newFriend];
  await updateDoc(userRef, { friends: updatedFriends });

  return { success: true, message: 'Друг добавлен!' };
};

export const removeFriend = async (currentUserId: string, friendUid: string): Promise<{ success: boolean; message: string }> => {
  const userRef = doc(db, 'users', currentUserId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { success: false, message: 'Ошибка пользователя' };
  }

  const userData = userSnap.data() as User;
  const updatedFriends = userData.friends.filter(f => f.uid !== friendUid);
  
  await updateDoc(userRef, { friends: updatedFriends });

  return { success: true, message: 'Друг удалён' };
};

export const getFriendsData = async (friendUids: string[]): Promise<User[]> => {
  const friends: User[] = [];
  
  for (const uid of friendUids) {
    const user = await getUserData(uid);
    if (user) {
      friends.push(user);
    }
  }
  
  return friends;
};
