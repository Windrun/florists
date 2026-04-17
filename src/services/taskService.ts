import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { User, DailyTask } from '../types';

const TASK_DEFINITIONS = [
  { id: 'plant_3', type: 'plant', target: 3, reward: 20, title: 'Посадить 3 цветка', icon: '🌱' },
  { id: 'harvest_5', type: 'harvest', target: 5, reward: 30, title: 'Собрать 5 урожаев', icon: '🪙' },
  { id: 'help_2', type: 'help', target: 2, reward: 15, title: 'Помочь 2 друзьям', icon: '💧' },
];

const isSameDay = (ts1: number, ts2: number): boolean => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export const generateDailyTasks = (): DailyTask[] => {
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return TASK_DEFINITIONS.map(def => ({
    id: def.id,
    type: def.type as 'plant' | 'harvest' | 'help',
    target: def.target,
    progress: 0,
    claimed: false,
    expiresAt: endOfDay.getTime(),
  }));
};

export const getDailyTasks = async (uid: string): Promise<DailyTask[]> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return [];
  
  const userData = userSnap.data() as User;
  const now = Date.now();
  
  if (!userData.dailyTasks || userData.dailyTasks.length === 0 || 
      !userData.lastTaskReset || !isSameDay(userData.lastTaskReset, now)) {
    return generateDailyTasks();
  }
  
  return userData.dailyTasks;
};

export const updateTaskProgress = async (uid: string, actionType: 'plant' | 'harvest' | 'help') => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data() as User;
  const now = Date.now();
  
  let tasks: DailyTask[];
  
  if (!userData.dailyTasks || userData.dailyTasks.length === 0 ||
      !userData.lastTaskReset || !isSameDay(userData.lastTaskReset, now)) {
    tasks = generateDailyTasks();
    await updateDoc(userRef, { 
      dailyTasks: tasks, 
      lastTaskReset: now 
    });
  } else {
    tasks = userData.dailyTasks;
  }
  
  const taskIndex = tasks.findIndex(t => t.type === actionType && !t.claimed);
  if (taskIndex === -1) return;
  
  const task = tasks[taskIndex];
  if (task.progress >= task.target) return;
  
  task.progress = Math.min(task.progress + 1, task.target);
  
  await updateDoc(userRef, { dailyTasks: tasks });
};

export const claimTaskReward = async (uid: string, taskId: string): Promise<{ success: boolean; message: string; reward: number }> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { success: false, message: 'User not found', reward: 0 };
  }
  
  const userData = userSnap.data() as User;
  const tasks = userData.dailyTasks || [];
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return { success: false, message: 'Task not found', reward: 0 };
  }
  
  const task = tasks[taskIndex];
  
  if (!task.claimed && task.progress >= task.target) {
    tasks[taskIndex] = { ...task, claimed: true };
    
    const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);
    const reward = taskDef?.reward || 10;
    
    await updateDoc(userRef, { 
      dailyTasks: tasks,
      coins: increment(reward)
    });
    
    return { success: true, message: `+${reward}🪙!`, reward };
  }
  
  return { success: false, message: 'Task not completed', reward: 0 };
};

export const getTaskReward = (taskId: string): number => {
  const def = TASK_DEFINITIONS.find(t => t.id === taskId);
  return def?.reward || 10;
};
