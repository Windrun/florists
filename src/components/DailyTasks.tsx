import { useState, useEffect } from 'react';
import { User, DailyTask } from '../types';
import { getDailyTasks, claimTaskReward } from '../services/taskService';
import { useToast } from '../App';

interface DailyTasksProps {
  user: User | null;
  onRefresh: () => void;
}

const TASK_INFO: Record<string, { icon: string; title: string }> = {
  'plant_3': { icon: '🌱', title: 'Посадить цветы' },
  'harvest_5': { icon: '🪙', title: 'Собрать урожай' },
  'help_2': { icon: '💧', title: 'Помочь друзьям' },
};

const DailyTasks = ({ user, onRefresh }: DailyTasksProps) => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [user.uid]);

  const loadTasks = async () => {
    setLoading(true);
    const taskData = await getDailyTasks(user.uid);
    setTasks(taskData);
    setLoading(false);
  };

  const handleClaim = async (taskId: string) => {
    if (claimingId) return;
    
    setClaimingId(taskId);
    try {
      const result = await claimTaskReward(user.uid, taskId);
      
      if (result.success) {
        showToast(result.message, 'success');
        await loadTasks();
        onRefresh();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('Ошибка', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const completedCount = tasks.filter(t => t.claimed).length;
  const allCompleted = completedCount === tasks.length && tasks.length > 0;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 shadow-lg animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <div>
            <div className="text-white font-bold">Ежедневные задания</div>
            <div className="text-blue-100 text-xs">
              {completedCount} / {tasks.length} выполнено
            </div>
          </div>
        </div>
        {allCompleted && (
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
            ✨ Все сделано!
          </div>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const isCompleted = task.progress >= task.target;
          const canClaim = isCompleted && !task.claimed;
          const taskInfo = TASK_INFO[task.id] || { icon: '?', title: task.id };
          
          return (
            <div
              key={task.id}
              className={`bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 transition-all ${
                task.claimed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{taskInfo.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {taskInfo.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.progress} / {task.target}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    +{task.progress >= task.target ? (task.type === 'plant' ? 20 : task.type === 'harvest' ? 30 : 15) : 0}🪙
                  </div>
                  
                  {task.claimed ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaim(task.id)}
                      disabled={claimingId === task.id}
                      className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-transform hover:scale-110"
                    >
                      {claimingId === task.id ? '...' : '!'}
                    </button>
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 text-sm">
                      {task.progress}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-400'
                  }`}
                  style={{ width: `${(task.progress / task.target) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTasks;
