export const LEVELS = {
  BRONZE: {
    name: 'Bronze Sidequester',
    color: '#CD7F32',
    min: 0,
    max: 10,
    perks: ['Accesso base alla piattaforma']
  },
  SILVER: {
    name: 'Silver Sidequester',
    color: '#C0C0C0',
    min: 11,
    max: 30,
    perks: [
      'Badge visibile nel profilo',
      'Priorità supporto clienti'
    ]
  },
  GOLD: {
    name: 'Gold Sidequester',
    color: '#FFD60A',
    min: 31,
    max: 75,
    perks: [
      'Priorità missioni premium',
      '+5% guadagno per missione',
      'Badge Gold nel profilo'
    ]
  },
  PLATINUM: {
    name: 'Platinum Sidequester',
    color: '#E5E4E2',
    min: 76,
    max: Infinity,
    perks: [
      'Tutte le funzionalità',
      '+10% guadagno per missione',
      'Badge Platinum esclusivo',
      'Inviti eventi speciali'
    ]
  }
};

export type LevelKey = keyof typeof LEVELS;

export function getUserLevel(missionCount: number) {
  for (const [key, level] of Object.entries(LEVELS)) {
    if (missionCount >= level.min && missionCount <= level.max) {
      return { key: key as LevelKey, ...level };
    }
  }
  return { key: 'BRONZE' as LevelKey, ...LEVELS.BRONZE };
}

export const ACHIEVEMENTS = [
  {
    id: 'first_mission',
    title: 'Prima Missione',
    description: 'Completa la tua prima missione',
    icon: '🎯',
    requirement: 1,
    type: 'mission_count' as const
  },
  {
    id: 'ten_missions',
    title: 'Veterano',
    description: 'Completa 10 missioni',
    icon: '🏆',
    requirement: 10,
    type: 'mission_count' as const
  },
  {
    id: 'hundred_earned',
    title: 'Primo Centinaio',
    description: 'Guadagna €100',
    icon: '💰',
    requirement: 100,
    type: 'earnings' as const
  },
  {
    id: 'five_stars',
    title: 'Stelle Perfette',
    description: 'Ottieni 5 stelle per 5 missioni consecutive',
    icon: '⭐',
    requirement: 5,
    type: 'rating_streak' as const
  },
  {
    id: 'week_streak',
    title: 'Dedizione',
    description: 'Completa almeno una missione al giorno per 7 giorni',
    icon: '🔥',
    requirement: 7,
    type: 'daily_streak' as const
  },
  {
    id: 'fast_responder',
    title: 'Fulmine',
    description: 'Accetta una missione entro 5 minuti dalla pubblicazione',
    icon: '⚡',
    requirement: 1,
    type: 'speed' as const
  },
  {
    id: 'five_hundred_earned',
    title: 'Guadagno Solido',
    description: 'Guadagna €500',
    icon: '💎',
    requirement: 500,
    type: 'earnings' as const
  },
  {
    id: 'fifty_missions',
    title: 'Professionista',
    description: 'Completa 50 missioni',
    icon: '🎖️',
    requirement: 50,
    type: 'mission_count' as const
  }
];

export function checkAchievements(user: {
  missions_completed: number;
  total_earnings: number;
  rating_average?: number;
}) {
  return ACHIEVEMENTS.map(achievement => {
    let unlocked = false;
    let progress = 0;

    switch (achievement.type) {
      case 'mission_count':
        progress = user.missions_completed;
        unlocked = progress >= achievement.requirement;
        break;
      case 'earnings':
        progress = user.total_earnings;
        unlocked = progress >= achievement.requirement;
        break;
      case 'rating_streak':
      case 'daily_streak':
      case 'speed':
        // Questi richiederebbero dati aggiuntivi dal DB
        progress = 0;
        unlocked = false;
        break;
    }

    return {
      ...achievement,
      unlocked,
      progress: unlocked ? 100 : Math.min((progress / achievement.requirement) * 100, 99),
      unlockedAt: unlocked ? new Date().toISOString() : undefined
    };
  });
}
