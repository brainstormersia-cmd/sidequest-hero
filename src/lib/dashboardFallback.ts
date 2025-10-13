export const fallbackMissions = [
  {
    id: "fallback-1",
    title: "Dog sitter per il weekend",
    description: "Accudisci un golden retriever per due giorni, includendo due passeggiate al giorno nel parco vicino.",
    price: 55,
    location: "Milano (MI)",
    created_at: new Date().toISOString(),
    profiles: {
      first_name: "Giulia",
      last_name: "Rossi",
      rating_average: 4.9,
      avatar_url: undefined
    },
    mission_categories: {
      name: "Pet care",
      icon: "🐶"
    }
  },
  {
    id: "fallback-2",
    title: "Consegna pacchi in centro",
    description: "Aiuta una piccola bottega consegnando 5 pacchi in bicicletta nel centro storico durante il pomeriggio.",
    price: 40,
    location: "Bologna (BO)",
    created_at: new Date().toISOString(),
    profiles: {
      first_name: "Luca",
      last_name: "Ferri",
      rating_average: 4.8,
      avatar_url: undefined
    },
    mission_categories: {
      name: "Delivery",
      icon: "📦"
    }
  },
  {
    id: "fallback-3",
    title: "Supporto spesa settimanale",
    description: "Accompagna una famiglia a fare la spesa al supermercato e aiuta con il trasporto delle buste a casa.",
    price: 35,
    location: "Torino (TO)",
    created_at: new Date().toISOString(),
    profiles: {
      first_name: "Marta",
      last_name: "Neri",
      rating_average: 5,
      avatar_url: undefined
    },
    mission_categories: {
      name: "Assistenza",
      icon: "🛒"
    }
  },
  {
    id: "fallback-4",
    title: "Aiuto trasloco smart",
    description: "Supporta un giovane professionista nello smontaggio di mobili leggeri e nel trasporto con montacarichi.",
    price: 85,
    location: "Roma (RM)",
    created_at: new Date().toISOString(),
    profiles: {
      first_name: "Fabio",
      last_name: "Marini",
      rating_average: 4.7,
      avatar_url: undefined
    },
    mission_categories: {
      name: "Traslochi",
      icon: "🚚"
    }
  }
];

export const fallbackTopUsers = [
  {
    user_id: "fallback-user-1",
    first_name: "Sara",
    last_name: "Conti",
    avatar_url: undefined,
    rating_average: 4.95,
    missions_completed: 68,
    total_earnings: 4850
  },
  {
    user_id: "fallback-user-2",
    first_name: "Davide",
    last_name: "Riva",
    avatar_url: undefined,
    rating_average: 4.9,
    missions_completed: 54,
    total_earnings: 4210
  },
  {
    user_id: "fallback-user-3",
    first_name: "Alessia",
    last_name: "Moretti",
    avatar_url: undefined,
    rating_average: 4.85,
    missions_completed: 49,
    total_earnings: 3980
  }
];

export const fallbackCommunityStats = {
  totalEarnings: fallbackTopUsers.reduce((sum, user) => sum + user.total_earnings, 0),
  activeMissions: fallbackMissions.length * 8,
  totalUsers: 3680
};
