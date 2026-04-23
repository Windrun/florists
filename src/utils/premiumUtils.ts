export interface PremiumSubscription {
  tier: 'monthly' | 'yearly' | 'lifetime';
  price: number;
  features: string[];
  gemBonus?: number;
  discount?: number;
}

export const PREMIUM_PLANS: PremiumSubscription[] = [
  {
    tier: 'monthly',
    price: 99,
    features: [
      '额外 10 能量上限',
      '每日奖励 +50%',
      '独家皮肤',
      '无广告',
    ],
    gemBonus: 50,
  },
  {
    tier: 'yearly',
    price: 799,
    features: [
      '额外 20 能量上限',
      '每日奖励翻倍',
      '所有独家皮肤',
      '无广告',
      '优先支持',
    ],
    gemBonus: 500,
    discount: 35,
  },
  {
    tier: 'lifetime',
    price: 2499,
    features: [
      '无限能量上限',
      '每日奖励 x3',
      '所有皮肤',
      '无广告',
      '优先支持',
      '专属徽章',
    ],
    gemBonus: 2000,
  },
];

export const isPremiumActive = (user: { isPremium?: boolean; premiumExpiresAt?: number }): boolean => {
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return user.premiumExpiresAt > Date.now();
};