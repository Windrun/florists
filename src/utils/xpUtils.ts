export const XP_REWARDS = {
  PLANT_FLOWER: 5,
  HARVEST_FLOWER: 10,
  HELP_FRIEND: 3,
} as const;

export const getXpReward = (action: keyof typeof XP_REWARDS): number => {
  return XP_REWARDS[action] || 0;
};
