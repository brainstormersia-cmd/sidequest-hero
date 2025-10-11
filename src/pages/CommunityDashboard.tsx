import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  MessageSquare, 
  Briefcase, 
  Bell, 
  Wallet, 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp, 
  Award,
  Users,
  Sparkles,
  Target
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

interface Mission {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    rating_average: number;
    avatar_url?: string;
  };
  mission_categories: {
    name: string;
    icon: string;
  };
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
    className={`p-4 cursor-pointer transition-bounce hover:scale-[1.02] active:scale-95 ${
      variant === "primary" ? "bg-primary text-primary-foreground shadow-floating" : "bg-card shadow-card"
    }`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-center">{label}</span>
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
  value: string | number; 
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
}) => (
  <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-floating transition-smooth">
    <div className="flex items-center justify-between mb-2">
      {icon && <div className="text-primary">{icon}</div>}
      {trend && <Badge variant="secondary" className="text-xs">{trend}</Badge>}
    </div>
    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    <p className="text-sm font-medium text-foreground">{title}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </Card>
);

const MissionCard = ({ mission, isGuest }: { mission: Mission; isGuest: boolean }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="mission-card cursor-pointer"
      onClick={() => navigate(`/missions/${mission.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg">{mission.mission_categories?.icon || '⭐'}</span>
          </div>
          <div>
            <h4 className="font-semibold text-foreground line-clamp-1">{mission.title}</h4>
            <p className="text-sm text-muted-foreground">{mission.mission_categories?.name}</p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          €{mission.price}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {mission.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{mission.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span>{mission.profiles?.rating_average || 5.0}</span>
        </div>
      </div>
      
      {!isGuest && (
        <Button 
          className="w-full mt-3 h-8 text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            // Handle accept mission
          }}
        >
          Accetta Missione
        </Button>
      )}
    </Card>
  );
};

const UserHeroCard = ({ user }: { user: TopUser }) => (
  <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-floating transition-smooth cursor-pointer">
    <div className="flex items-center gap-3">
      <Avatar className="w-12 h-12 border-2 border-primary/20">
        <AvatarImage src={user.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground">
            {user.first_name} {user.last_name}
          </h4>
          <Award className="w-4 h-4 text-warning" />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span>{user.rating_average.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{user.missions_completed} missioni</span>
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

  useEffect(() => {
    if (authLoading) return;
    
    if (!isGuest && !user) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, navigate, isGuest]);

  const fetchDashboardData = async () => {
    try {
      // Fetch trending missions
      const { data: missionsData } = await supabase
        .from('missions')
        .select(`
          id,
          title,
          description,
          price,
          location,
          created_at,
          profiles!missions_owner_id_fkey(
            first_name,
            last_name,
            rating_average,
            avatar_url
          ),
          mission_categories(
            name,
            icon
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch top users
      const { data: topUsersData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, rating_average, missions_completed, total_earnings')
        .order('rating_average', { ascending: false })
        .order('missions_completed', { ascending: false })
        .limit(3);

      // Fetch community stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeMissions } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { data: earningsData } = await supabase
        .from('profiles')
        .select('total_earnings');

      const totalEarnings = earningsData?.reduce((sum, profile) => sum + (profile.total_earnings || 0), 0) || 0;

      // Fetch unread notifications for authenticated users
      let notificationCount = 0;
      if (!isGuest && user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        notificationCount = count || 0;
      }

      setMissions(missionsData || []);
      setTopUsers(topUsersData || []);
      setCommunityStats({
        totalEarnings,
        activeMissions: activeMissions || 0,
        totalUsers: totalUsers || 0
      });
      setUnreadNotifications(notificationCount);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = isGuest ? [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Esplora missioni",
      onClick: () => navigate("/missions")
    },
    {
      icon: <Plus className="w-6 h-6" />,
      label: "Registrati ora",
      onClick: () => navigate("/"),
      variant: "primary" as const
    }
  ] : [
    {
      icon: <Plus className="w-6 h-6" />,
      label: "Crea missione",
      onClick: () => navigate("/create-mission"),
      variant: "primary" as const
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Missioni",
      onClick: () => navigate("/missions")
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: "Messaggi",
      onClick: () => navigate("/chat")
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="px-6 py-4">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="px-6 py-6 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {isGuest ? (
                  <>
                    <Sparkles className="w-6 h-6 text-primary" />
                    Esplora SideQuest
                  </>
                ) : (
                  <>
                    Ciao, {profile?.first_name || 'Sidequester'}!
                    <span className="text-lg">👋</span>
                  </>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isGuest 
                  ? "Scopri le opportunità della community" 
                  : "Pronto per la tua prossima missione?"
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isGuest && profile && (
                <Card className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl shadow-floating border-0">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    <div className="text-left">
                      <p className="text-xs opacity-80 font-medium">Saldo</p>
                      <p className="text-lg font-black leading-none">
                        <AnimatedCounter 
                          value={profile.total_earnings || 0} 
                          prefix="€"
                          decimals={2}
                          duration={800}
                        />
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-24">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isGuest ? 'Inizia subito' : 'Azioni rapide'}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </section>

        {/* Live Activity Feed */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            Cosa sta succedendo ORA
          </h2>
          <LiveActivityFeed />
        </section>

        {/* Community Stats */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            La Community Oggi
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-floating transition-smooth">
              <div className="flex items-center justify-between mb-2">
                <div className="text-primary"><TrendingUp className="w-4 h-4" /></div>
                <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">+12%</Badge>
              </div>
              <h3 className="text-3xl font-black text-foreground">
                <AnimatedCounter 
                  value={communityStats.totalEarnings * 0.1} 
                  prefix="€"
                  suffix="K"
                  decimals={1}
                  duration={1200}
                />
              </h3>
              <p className="text-sm font-medium text-foreground">Guadagnato oggi</p>
              <p className="text-xs text-muted-foreground mt-1">🔥 In crescita</p>
            </Card>
            <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-floating transition-smooth">
              <div className="flex items-center justify-between mb-2">
                <div className="text-primary"><Briefcase className="w-4 h-4" /></div>
                <Badge variant="secondary" className="text-xs">+{Math.floor(communityStats.activeMissions * 0.2)}</Badge>
              </div>
              <h3 className="text-3xl font-black text-foreground">
                <AnimatedCounter 
                  value={communityStats.activeMissions} 
                  decimals={0}
                  duration={1000}
                />
              </h3>
              <p className="text-sm font-medium text-foreground">Missioni attive ORA</p>
              <p className="text-xs text-muted-foreground mt-1">👀 Disponibili</p>
            </Card>
            <Card className="p-4 bg-gradient-card border-0 shadow-card hover:shadow-floating transition-smooth">
              <div className="flex items-center justify-between mb-2">
                <div className="text-primary"><Users className="w-4 h-4" /></div>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">+47</Badge>
              </div>
              <h3 className="text-3xl font-black text-foreground">
                <AnimatedCounter 
                  value={communityStats.totalUsers} 
                  decimals={0}
                  duration={1000}
                />
              </h3>
              <p className="text-sm font-medium text-foreground">Sidequester online</p>
              <p className="text-xs text-muted-foreground mt-1">💪 Community attiva</p>
            </Card>
          </div>
        </section>

        {/* Personal Earnings Widget (for logged in users) */}
        {!isGuest && profile && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Il Tuo Riepilogo
            </h2>
            <PersonalEarningsWidget
              totalEarnings={profile.total_earnings || 0}
              weeklyEarnings={125}
              weeklyChange={45}
              missionCount={profile.missions_completed || 0}
              nextMilestone={{ value: 500, label: 'Livello Gold' }}
            />
          </section>
        )}

        {/* Gamification Section (for logged in users) */}
        {!isGuest && profile && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Il Tuo Livello
            </h2>
            <LevelBadge
              currentLevel={getUserLevel(profile.missions_completed || 0).name}
              nextLevel={getUserLevel((profile.missions_completed || 0) + 1).name !== getUserLevel(profile.missions_completed || 0).name ? getUserLevel((profile.missions_completed || 0) + 1).name : 'Livello Massimo'}
              progress={((profile.missions_completed || 0) % 30 / 30) * 100}
              perks={getUserLevel(profile.missions_completed || 0).perks}
            />
          </section>
        )}

        {/* SideQuest Heroes */}
        {topUsers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              SideQuest Heroes
            </h2>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.user_id} className="relative">
                  {index === 0 && (
                    <Badge className="absolute -top-2 -left-2 bg-warning text-warning-foreground z-10">
                      👑 Top Hero
                    </Badge>
                  )}
                  <UserHeroCard user={user} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Missions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isGuest ? 'Scopri le Missioni' : 'Trending Ora'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/missions")}
              className="text-primary hover:text-primary/80"
            >
              Vedi tutte
            </Button>
          </div>
          <div className="grid gap-4">
            {missions.slice(0, 4).map((mission) => (
              <MissionCard key={mission.id} mission={mission} isGuest={isGuest} />
            ))}
            {missions.length === 0 && (
              <Card className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nessuna missione al momento
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isGuest 
                    ? "Registrati per vedere le opportunità disponibili!"
                    : "Sii il primo a creare una missione oggi!"
                  }
                </p>
                <Button
                  onClick={() => navigate(isGuest ? "/" : "/create-mission")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isGuest ? "Registrati ora" : "Crea la prima missione"}
                </Button>
              </Card>
            )}
          </div>
        </section>

        {/* Your Stats (for logged in users) */}
        {!isGuest && profile && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">Le tue statistiche</h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                title="Missioni create"
                value={profile.missions_created || 0}
                subtitle="Questo mese"
              />
              <StatCard
                title="Missioni accettate"
                value={profile.missions_completed || 0}
                subtitle={`Rating: ${profile.rating_average?.toFixed(1) || '5.0'}`}
              />
              <StatCard
                title="Guadagni totali"
                value={`€${profile.total_earnings?.toFixed(0) || '0'}`}
                subtitle="⭐ Ottimo lavoro!"
              />
            </div>
          </section>
        )}

        {/* Guest CTA */}
        {isGuest && (
          <section className="pt-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Pronto a iniziare?
              </h3>
              <p className="text-muted-foreground mb-6">
                Unisciti a migliaia di persone che hanno già trasformato il loro tempo libero in opportunità concrete.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Registrati Gratis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Accedi
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
};

export default CommunityDashboard;