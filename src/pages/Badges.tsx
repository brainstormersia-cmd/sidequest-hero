import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Lock } from "lucide-react";

const Badges = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const { data: allBadges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: userAchievements, isLoading: loadingAchievements, refetch } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, badges(*)')
        .eq('user_id', user!.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Auto-unlock logic
  useEffect(() => {
    if (!profile || !allBadges || !userAchievements || !user) return;
    
    const checkAndUnlockBadges = async () => {
      for (const badge of allBadges) {
        const alreadyUnlocked = userAchievements.some(ub => ub.badge_id === badge.id);
        if (alreadyUnlocked) continue;
        
        let shouldUnlock = false;
        
        if (badge.requirement_type === 'missions_count') {
          shouldUnlock = (profile.missions_completed || 0) >= badge.requirement_value;
        } else if (badge.requirement_type === 'earnings_total') {
          shouldUnlock = (profile.total_earnings || 0) >= badge.requirement_value;
        } else if (badge.requirement_type === 'rating_min') {
          shouldUnlock = ((profile.rating_average || 0) * 10) >= badge.requirement_value;
        }
        
        if (shouldUnlock) {
          const { error } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              badge_id: badge.id
            });
          
          if (!error) {
            toast({
              title: `🎉 Nuovo badge sbloccato!`,
              description: `Hai ottenuto: ${badge.name} ${badge.icon}`,
            });
            refetch();
          }
        }
      }
    };
    
    checkAndUnlockBadges();
  }, [profile, allBadges, userAchievements, user, toast, refetch]);

  const getProgress = (badge: any) => {
    if (!profile) return 0;
    
    let current = 0;
    if (badge.requirement_type === 'missions_count') {
      current = profile.missions_completed || 0;
    } else if (badge.requirement_type === 'earnings_total') {
      current = profile.total_earnings || 0;
    } else if (badge.requirement_type === 'rating_min') {
      current = (profile.rating_average || 0) * 10;
    }
    
    return Math.min(100, (current / badge.requirement_value) * 100);
  };

  const isUnlocked = (badgeId: string) => {
    return userAchievements?.some(ua => ua.badge_id === badgeId);
  };

  const categoryColors: Record<string, string> = {
    missions: 'bg-blue-500',
    earnings: 'bg-green-500',
    social: 'bg-purple-500',
    special: 'bg-orange-500'
  };

  if (loadingBadges || loadingAchievements) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedBadges = allBadges?.filter(b => isUnlocked(b.id)) || [];
  const lockedBadges = allBadges?.filter(b => !isUnlocked(b.id)) || [];

  const recentlyUnlocked = unlockedBadges.slice(-3).reverse();
  const nextToUnlock = lockedBadges
    .map(badge => ({
      ...badge,
      progress: getProgress(badge)
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">I Tuoi Badge</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Hai sbloccato {unlockedBadges.length} di {allBadges?.length || 0} badge disponibili
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 max-w-6xl mx-auto space-y-8">
        {/* Recently Unlocked - Celebratory Section */}
        {recentlyUnlocked.length > 0 && (
          <section className="animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-success/10 p-8 border-2 border-primary/20">
              <div className="absolute top-0 right-0 text-9xl opacity-10">🎉</div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-4xl animate-bounce">🏆</span>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Sbloccati di Recente!
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentlyUnlocked.map((badge) => {
                  const achievement = userAchievements?.find(ua => ua.badge_id === badge.id);
                  return (
                    <Card 
                      key={badge.id} 
                      className="p-6 bg-card border-primary/30 shadow-elegant hover:scale-105 transition-bounce"
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-3 animate-bounce">{badge.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {badge.description}
                        </p>
                        {achievement && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            {new Date(achievement.unlocked_at).toLocaleDateString('it-IT')}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Next Goals - Motivational Section */}
        {nextToUnlock.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <span>Prossimi Obiettivi</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nextToUnlock.map((badge) => {
                return (
                  <Card 
                    key={badge.id} 
                    className="p-6 bg-gradient-to-br from-card to-muted/30 border-border hover:border-primary/50 transition-smooth group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl grayscale group-hover:grayscale-0 transition-all">
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {badge.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="text-primary">{Math.round(badge.progress)}%</span>
                          </div>
                          <Progress value={badge.progress} className="h-2.5 bg-muted" />
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs"
                          >
                            {badge.requirement_type === 'missions_count' && 
                              `${profile?.missions_completed || 0}/${badge.requirement_value} missioni`}
                            {badge.requirement_type === 'earnings_total' && 
                              `€${profile?.total_earnings || 0}/€${badge.requirement_value}`}
                            {badge.requirement_type === 'rating_min' && 
                              `Rating: ${(profile?.rating_average || 0).toFixed(1)}/5.0`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* All Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Tutti i Badge Sbloccati ({unlockedBadges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {unlockedBadges.map((badge) => {
                return (
                  <Card 
                    key={badge.id} 
                    className="p-4 bg-card border-primary/10 hover:border-primary/30 transition-smooth text-center group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </div>
                    <h3 className="font-semibold text-xs line-clamp-1">{badge.name}</h3>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* All Locked Badges */}
        {lockedBadges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Da Sbloccare ({lockedBadges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {lockedBadges.map((badge) => {
                const progress = getProgress(badge);
                return (
                  <Card 
                    key={badge.id} 
                    className="p-4 bg-muted/30 border-border/50 opacity-60 hover:opacity-100 transition-smooth text-center"
                  >
                    <div className="text-4xl mb-2 grayscale">
                      {badge.icon}
                    </div>
                    <h3 className="font-semibold text-xs line-clamp-1 mb-1">{badge.name}</h3>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Badges;
