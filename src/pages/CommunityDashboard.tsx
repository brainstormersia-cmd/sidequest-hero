import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  MessageSquare, 
  Briefcase, 
  Bell, 
  Wallet, 
  MapPin, 
  Star, 
  TrendingUp, 
  Award,
  Users,
  Sparkles,
  Target,
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { PersonalEarningsWidget } from "@/components/PersonalEarningsWidget";
import { LevelBadge } from "@/components/LevelBadge";
import { getUserLevel } from "@/lib/gamification";
import {
  fallbackCommunityStats,
  fallbackMissions,
  fallbackTopUsers
} from "@/lib/dashboardFallback";

const typedFallbackMissions = fallbackMissions as Mission[];

interface MissionCategory {
  name: string;
  icon: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  category_id?: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    rating_average: number;
    avatar_url?: string;
  } | null;
  mission_categories?: MissionCategory | null;
}

interface TopUser {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  rating_average: number;
  missions_completed: number;
  total_earnings: number;
}

const defaultMissionCategory: MissionCategory = {
  name: "Missione",
  icon: "⭐"
};

const fallbackCategoryHints: Record<string, MissionCategory> = typedFallbackMissions.reduce(
  (acc, mission) => {
    if (mission.mission_categories?.name) {
      acc[mission.mission_categories.name.toLowerCase()] = mission.mission_categories;
    }
    return acc;
  },
  {} as Record<string, MissionCategory>
);

const resolveMissionCategory = (mission: Mission): MissionCategory => {
  if (mission.mission_categories?.name) {
    return mission.mission_categories;
  }

  const missionWithCategoryName = mission as Mission & {
    category_name?: string | null;
    category?: string | null;
  };

  const categoryName = missionWithCategoryName.category_name || missionWithCategoryName.category;

  if (categoryName && typeof categoryName === "string") {
    const normalized = categoryName.toLowerCase();
    return fallbackCategoryHints[normalized] || {
      name: categoryName,
      icon: "⭐"
    };
  }

  return defaultMissionCategory;
};

const QuickAction = ({
  icon,
  label,
  onClick,
  variant = "default"
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: "default" | "primary";
}) => (
  <Card 
    className={`p-3 sm:p-4 cursor-pointer transition-bounce hover:scale-[1.02] active:scale-95 touch-manipulation ${
      variant === "primary" ? "bg-primary text-primary-foreground shadow-floating" : "bg-card shadow-card"
    }`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-2">
      {icon}
      <span className="text-xs sm:text-sm font-medium text-center">{label}</span>
    </div>
  </Card>
);

const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon,
  trend
}: { 
  title: string; 
  value: string | number | React.ReactNode; 
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
}) => (
  <Card className="p-3 sm:p-4 bg-gradient-card border-0 shadow-card hover:shadow-floating transition-smooth">
    <div className="flex items-center justify-between mb-2">
      {icon && <div className="text-primary">{icon}</div>}
      {trend && <Badge variant="secondary" className="text-xs">{trend}</Badge>}
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{value}</h3>
    <p className="text-xs sm:text-sm font-medium text-foreground">{title}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </Card>
);

const MissionCard = ({ mission, isGuest }: { mission: Mission; isGuest: boolean }) => {
  const navigate = useNavigate();
  const category = resolveMissionCategory(mission);

  return (
    <Card
      className="mission-card cursor-pointer"
      onClick={() => navigate(`/missions/${mission.id}`)}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-base sm:text-lg">{category.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1">{mission.title}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">{category.name}</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 flex-shrink-0 ml-2">
          €{mission.price}
        </Badge>
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
        {mission.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{mission.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span>{mission.profiles?.rating_average ?? 5.0}</span>
        </div>
      </div>

      {!isGuest && (
        <Button
          className="w-full mt-3 h-8 text-xs sm:text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/missions/${mission.id}`);
          }}
        >
          Vedi dettagli
        </Button>
      )}
    </Card>
  );
};

const UserHeroCard = ({ user }: { user: TopUser }) => (
  <Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-floating transition-smooth cursor-pointer">
    <div className="flex items-center gap-2 sm:gap-3">
      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs sm:text-sm">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
            {user.first_name} {user.last_name}
          </h4>
          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-warning flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span>{user.rating_average.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{user.missions_completed}</span>
          </div>
          <div className="text-primary font-medium">
            €{user.total_earnings.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';
  
  const [missions, setMissions] = useState<Mission[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalEarnings: 0,
    activeMissions: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Redirect if not authenticated and not in guest mode
  useEffect(() => {
    if (authLoading) return;

    if (!isGuest && !user) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, navigate, isGuest, fetchDashboardData]);

  const applyFallbackData = useCallback(() => {
    if (!isMountedRef.current) return;

    setMissions(typedFallbackMissions);
    setTopUsers(fallbackTopUsers);
    setCommunityStats({
      totalEarnings: fallbackCommunityStats.totalEarnings,
      activeMissions: fallbackCommunityStats.activeMissions,
      totalUsers: fallbackCommunityStats.totalUsers
    });
    setUsingFallbackData(true);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setUsingFallbackData(false);

    try {
      const [
        missionsResponse,
        topUsersResponse,
        totalUsersResponse,
        activeMissionsResponse,
        earningsResponse
      ] = await Promise.all([
        supabase
          .from('missions')
          .select(`
            id,
            title,
            description,
            price,
            location,
            created_at,
            category_id,
            profiles!missions_owner_id_fkey(
              first_name,
              last_name,
              rating_average,
              avatar_url
            )
          `)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url, rating_average, missions_completed, total_earnings')
          .order('rating_average', { ascending: false })
          .order('missions_completed', { ascending: false })
          .limit(3),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('missions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('profiles')
          .select('total_earnings')
      ]);

      if (!isMountedRef.current) {
        return;
      }

      const missionsData = missionsResponse.error
        ? []
        : (missionsResponse.data as Mission[] | null) || [];
      const topUsersData = topUsersResponse.error ? [] : topUsersResponse.data || [];
      const totalUsers = totalUsersResponse.error ? 0 : totalUsersResponse.count || 0;
      const activeMissions = activeMissionsResponse.error ? 0 : activeMissionsResponse.count || 0;
      const earningsData = earningsResponse.error ? [] : earningsResponse.data || [];

      let usedFallback = false;

      const normalizedMissions = missionsData.map((mission) => ({
        ...mission,
        mission_categories: mission.mission_categories || null
      }));

      setMissions(normalizedMissions.length ? normalizedMissions : (() => {
        usedFallback = true;
        return typedFallbackMissions;
      })());

      setTopUsers(topUsersData.length ? topUsersData : (() => {
        usedFallback = true;
        return fallbackTopUsers;
      })());

      const totalEarnings = earningsData.reduce(
        (sum: number, profile: { total_earnings?: number | null }) => sum + (profile.total_earnings || 0),
        0
      );

      const resolvedStats = {
        totalEarnings: totalEarnings || fallbackCommunityStats.totalEarnings,
        activeMissions: activeMissions || fallbackCommunityStats.activeMissions,
        totalUsers: totalUsers || fallbackCommunityStats.totalUsers
      };

      if (!totalEarnings || !activeMissions || !totalUsers) {
        usedFallback = true;
      }

      setCommunityStats(resolvedStats);

      // Fetch unread notifications for authenticated users
      let notificationCount = 0;
      if (!isGuest && user) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (!error) {
          notificationCount = count || 0;
        }
      }

      setUnreadNotifications(notificationCount);
      setUsingFallbackData(usedFallback);

      if (usedFallback) {
        toast({
          title: 'Modalità demo attiva',
          description: 'Mostriamo dati di esempio finché la connessione al backend non è disponibile.'
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      applyFallbackData();
      toast({
        variant: 'destructive',
        title: 'Impossibile aggiornare i dati',
        description: 'Stiamo mostrando dati di esempio. Riprova più tardi.'
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [applyFallbackData, isGuest, toast, user]);

  const quickActions = isGuest ? [
    {
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Esplora",
      onClick: () => navigate("/missions")
    },
    {
      icon: <Plus className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Registrati",
      onClick: () => navigate("/"),
      variant: "primary" as const
    }
  ] : [
    {
      icon: <Plus className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Crea",
      onClick: () => navigate("/create-mission"),
      variant: "primary" as const
    },
    {
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Missioni",
      onClick: () => navigate("/missions")
    },
    {
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: "Chat",
      onClick: () => navigate("/chat")
    }
  ];

  const containerClasses = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className={`${containerClasses} py-4`}>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className={`${containerClasses} py-8 space-y-8`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className={`${containerClasses} py-3 sm:py-4`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0 flex items-start justify-between gap-4 lg:justify-start">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 truncate">
                  {isGuest ? (
                    <>
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                      <span className="truncate">SideQuest</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">Ciao, {profile?.first_name || 'Sidequester'}!</span>
                      <span className="text-base sm:text-lg">👋</span>
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {isGuest
                    ? 'Scopri le opportunità'
                    : 'Pronto per la tua prossima missione?'
                  }
                </p>
              </div>
              {usingFallbackData && (
                <Badge variant="outline" className="inline-flex items-center gap-1 text-[11px] sm:text-xs whitespace-nowrap">
                  <Sparkles className="w-3 h-3" /> Demo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {!isGuest && profile && (
                <Card className="bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-floating border-0">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                    <div className="text-left">
                      <p className="text-xs font-semibold leading-none">
                        <AnimatedCounter
                          value={profile.total_earnings || 0}
                          prefix="€"
                          decimals={0}
                          duration={800}
                        />
                      </p>
                      <span className="text-[11px] text-primary-foreground/80 hidden sm:block">Totale guadagni</span>
                    </div>
                  </div>
                </Card>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] touch-manipulation"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-[10px] sm:text-xs bg-destructive">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className={`${containerClasses} py-6 sm:py-8 lg:py-10 space-y-8 pb-24`}>
        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </section>

        {/* Tabs for Organization */}
        <Tabs defaultValue={isGuest ? 'community' : 'personal'} className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex mb-6 lg:mb-8">
            {!isGuest && (
              <TabsTrigger value="personal" className="text-xs sm:text-sm px-3 sm:px-5">
                📊 Il Tuo Spazio
              </TabsTrigger>
            )}
            <TabsTrigger value="community" className="text-xs sm:text-sm px-3 sm:px-5">
              🌍 Community
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          {!isGuest && profile && (
            <TabsContent value="personal" className="space-y-6 lg:space-y-8">
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                <div>
                  <PersonalEarningsWidget
                    totalEarnings={profile.total_earnings || 0}
                    weeklyEarnings={125}
                    weeklyChange={45}
                    missionCount={profile.missions_completed || 0}
                    nextMilestone={{ value: 500, label: 'Livello Gold' }}
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Il Tuo Livello
                    </h2>
                    <LevelBadge
                      currentLevel={getUserLevel(profile.missions_completed || 0).name}
                      nextLevel={getUserLevel((profile.missions_completed || 0) + 1).name !== getUserLevel(profile.missions_completed || 0).name ? getUserLevel((profile.missions_completed || 0) + 1).name : 'Livello Massimo'}
                      progress={((profile.missions_completed || 0) % 30 / 30) * 100}
                      perks={getUserLevel(profile.missions_completed || 0).perks}
                    />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Le tue statistiche</h2>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <StatCard
                        title="Create"
                        value={profile.missions_created || 0}
                        subtitle="Missioni"
                      />
                      <StatCard
                        title="Completate"
                        value={profile.missions_completed || 0}
                        subtitle={`⭐ ${profile.rating_average?.toFixed(1) || '5.0'}`}
                      />
                      <StatCard
                        title="Guadagni"
                        value={`€${profile.total_earnings?.toFixed(0) || '0'}`}
                        subtitle="Totali"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6 lg:space-y-8">
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
              <div className="space-y-6 lg:space-y-8">
                {/* Live Activity Feed */}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                    </span>
                    Live Ora
                  </h2>
                  <LiveActivityFeed />
                </div>

                {/* Trending Missions */}
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      {isGuest ? 'Scopri' : 'Trending'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/missions')}
                      className="text-primary hover:text-primary/80 text-xs sm:text-sm touch-manipulation"
                    >
                      Vedi tutte
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                    {missions.slice(0, 4).map((mission) => (
                      <MissionCard key={mission.id} mission={mission} isGuest={isGuest} />
                    ))}
                    {missions.length === 0 && (
                      <Card className="p-6 sm:p-8 text-center">
                        <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                          Nessuna missione
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {isGuest
                            ? 'Registrati per vedere le opportunità!'
                            : 'Crea la prima missione oggi!'}
                        </p>
                        <Button
                          onClick={() => navigate(isGuest ? '/' : '/create-mission')}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation"
                        >
                          {isGuest ? 'Registrati' : 'Crea missione'}
                        </Button>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-8">
                {/* Community Stats */}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Community Oggi
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
                    <StatCard
                      icon={<TrendingUp className="w-4 h-4" />}
                      title="Guadagnato"
                      value={
                        <AnimatedCounter
                          value={communityStats.totalEarnings >= 1000 ? communityStats.totalEarnings / 1000 : communityStats.totalEarnings}
                          prefix="€"
                          suffix={communityStats.totalEarnings >= 1000 ? 'K' : ''}
                          decimals={communityStats.totalEarnings >= 1000 ? 1 : 0}
                          duration={1000}
                        />
                      }
                      trend="+18%"
                    />
                    <StatCard
                      icon={<Target className="w-4 h-4" />}
                      title="Missioni"
                      value={
                        <AnimatedCounter
                          value={communityStats.activeMissions}
                          decimals={0}
                          duration={1000}
                        />
                      }
                      trend={`+${Math.floor(communityStats.activeMissions * 0.2)}`}
                    />
                    <StatCard
                      icon={<Users className="w-4 h-4" />}
                      title="Online"
                      value={
                        <AnimatedCounter
                          value={communityStats.totalUsers}
                          decimals={0}
                          duration={1000}
                        />
                      }
                      trend="+47"
                    />
                  </div>
                </div>

                {/* Top Heroes - Compact */}
                {topUsers.length > 0 && (
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                      Top Heroes
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                      {topUsers.slice(0, 3).map((user, index) => (
                        <div key={user.user_id} className="relative">
                          {index === 0 && (
                            <Badge className="absolute -top-2 -left-2 bg-warning text-warning-foreground z-10 text-xs">
                              👑
                            </Badge>
                          )}
                          <UserHeroCard user={user} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Guest CTA */}
        {isGuest && (
          <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex-1">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Pronto a iniziare?
                </h3>
                <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Unisciti a migliaia di persone che trasformano il tempo libero in opportunità.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation"
                >
                  Registrati Gratis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 sm:flex-none sm:w-auto touch-manipulation"
                >
                  Accedi
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CommunityDashboard;
