import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Briefcase, TrendingUp, MessageSquare, MapPin, Trophy } from "lucide-react";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: reviews } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(first_name, last_name, avatar_url),
          missions(title)
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: achievements } = useQuery({
    queryKey: ['user-public-achievements', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <h2 className="text-xl font-bold mb-2">Utente non trovato</h2>
            <Button onClick={() => navigate(-1)}>Torna indietro</Button>
          </Card>
        </div>
      </div>
    );
  }

  const userLevel = Math.floor((profile.missions_completed || 0) / 10) + 1;

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                {profile.is_verified && (
                  <Badge variant="default">✓ Verificato</Badge>
                )}
              </div>
              
              {profile.location && (
                <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start mb-4">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </p>
              )}
              
              {profile.bio && (
                <p className="text-foreground/80 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Livello {userLevel}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{profile.rating_average?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">({profile.rating_count || 0} recensioni)</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contatta
              </Button>
              <Button variant="outline" onClick={() => navigate('/missions')}>
                Vedi Missioni
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <Briefcase className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold">{profile.missions_completed || 0}</p>
            <p className="text-sm text-muted-foreground">Missioni Completate</p>
          </Card>
          
          <Card className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold">€{profile.total_earnings?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-muted-foreground">Guadagni Totali</p>
          </Card>
          
          <Card className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-3xl font-bold">{profile.rating_average?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-muted-foreground">Rating Medio</p>
          </Card>
        </div>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Badge Sbloccati ({achievements.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.slice(0, 8).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted/50"
                >
                  <div className="text-4xl mb-2">{achievement.badges.icon}</div>
                  <p className="text-sm font-medium text-center">{achievement.badges.name}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recensioni</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                      <AvatarFallback>
                        {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">
                          {review.reviewer?.first_name} {review.reviewer?.last_name}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.missions?.title && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Missione: {review.missions.title}
                        </p>
                      )}
                      {review.comment && (
                        <p className="text-sm text-foreground/80">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
