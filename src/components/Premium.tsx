import { useState } from 'react';
import { User } from '../types';
import { PREMIUM_PLANS, PremiumSubscription, isPremiumActive } from '../utils/premiumUtils';
import { useToast } from '../App';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface PremiumProps {
  user: User | null;
}

const Premium = ({ user }: PremiumProps) => {
  const { showToast } = useToast();
  const [buying, setBuying] = useState<string | null>(null);
  const isUserPremium = user?.isPremium || false;

  const handleBuy = async (plan: PremiumSubscription) => {
    if (!user) return;
    setBuying(plan.tier);
    
    try {
      showToast('В разработке - скоро!', 'success');
    } catch (error) {
      showToast('Ошибка', 'error');
    } finally {
      setBuying(null);
    }
  };

  if (isUserPremium) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">👑</span>
          <div>
            <div className="text-2xl font-bold">Премиум</div>
            <div className="text-yellow-100">Активен</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm text-yellow-100">Энергия</div>
            <div className="text-xl font-bold">+20</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm text-yellow-100">Награды</div>
            <div className="text-xl font-bold">x2</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <div className="text-xl font-bold">Флористы Премиум</div>
            <div className="text-yellow-100 text-sm">Получите больше удовольствия!</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {PREMIUM_PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 ${
              plan.tier === 'yearly' ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-lg dark:text-gray-200 capitalize">{plan.tier}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{plan.features[0]}</div>
                {plan.discount && (
                  <div className="text-xs text-green-500">-{plan.discount}%</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold dark:text-gray-200">{plan.price}₽</div>
                {plan.gemBonus && (
                  <div className="text-sm text-purple-500">+{plan.gemBonus}💎</div>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {plan.features.map((feature, i) => (
                <div key={i} className="text-sm text-gray-600 dark:text-gray-400">✓ {feature}</div>
              ))}
            </div>

            <button
              onClick={() => handleBuy(plan)}
              disabled={buying === plan.tier}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                plan.tier === 'yearly'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200'
              }`}
            >
              {buying === plan.tier ? '...' : 'Купить'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Premium;