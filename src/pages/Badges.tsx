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
        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-primary">🏆</span>
              Sbloccati ({unlockedBadges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedBadges.map((badge) => {
                const achievement = userAchievements?.find(ua => ua.badge_id === badge.id);
                return (
                  <Card 
                    key={badge.id} 
                    className="p-6 bg-gradient-to-br from-card to-muted/50 border-primary/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        <Badge className={categoryColors[badge.category] || 'bg-gray-500'}>
                          {badge.category}
                        </Badge>
                        {achievement && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Sbloccato il {new Date(achievement.unlocked_at).toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Da Sbloccare ({lockedBadges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadges.map((badge) => {
                const progress = getProgress(badge);
                return (
                  <Card 
                    key={badge.id} 
                    className="p-6 opacity-60 hover:opacity-80 transition-smooth"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl grayscale">{badge.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {badge.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progresso</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        <Badge 
                          variant="outline" 
                          className="mt-3"
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
