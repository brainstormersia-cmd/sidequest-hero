export const mockEarningsHistory = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    .toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
  amount: Math.floor(Math.random() * 50) + 10
}));

export const mockCategoryStats = [
  { 
    name: 'Dog sitting', 
    earnings: 180, 
    count: 3, 
    color: '#FFD60A', 
    icon: '🐕' 
  },
  { 
    name: 'Consegne', 
    earnings: 120, 
    count: 8, 
    color: '#06FFA5', 
    icon: '📦' 
  },
  { 
    name: 'Spesa', 
    earnings: 85, 
    count: 6, 
    color: '#FF6B6B', 
    icon: '🛒' 
  },
  { 
    name: 'Traslochi', 
    earnings: 200, 
    count: 2, 
    color: '#4ECDC4', 
    icon: '📦' 
  },
  { 
    name: 'Altro', 
    earnings: 45, 
    count: 5, 
    color: '#95A5A6', 
    icon: '✨' 
  }
];

export const mockUserLevel = {
  currentLevel: 'Silver Sidequester',
  nextLevel: 'Gold Sidequester',
  progress: 72,
  perks: [
    'Priorità nelle missioni premium',
    'Badge visibile nel profilo',
    '+5% guadagno missioni'
  ]
};

export const mockWeeklyEarnings = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    .toLocaleDateString('it-IT', { weekday: 'short' }),
  amount: Math.floor(Math.random() * 40) + 5
}));
