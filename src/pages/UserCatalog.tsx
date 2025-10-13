import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Briefcase, Trophy } from "lucide-react";

const UserCatalog = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-catalog', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('rating_average', { ascending: false })
        .order('missions_completed', { ascending: false })
        .limit(50);
      
      if (search.trim()) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,location.ilike.%${search}%`
        );
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getUserLevel = (missionsCompleted: number) => {
    return Math.floor(missionsCompleted / 10) + 1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Community</h1>
                <p className="text-sm text-muted-foreground">
                  Scopri i membri della community SideQuest
                </p>
              </div>
            </div>
            
            <Input
              placeholder="Cerca per nome o località..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 max-w-6xl mx-auto">
        {!users || users.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun utente trovato</h3>
            <p className="text-muted-foreground">
              Prova a modificare i criteri di ricerca
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card
                key={user.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-smooth"
                onClick={() => navigate(`/users/${user.user_id}`)}
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4 border-2 border-primary/20">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-bold text-lg mb-1">
                    {user.first_name} {user.last_name}
                  </h3>
                  
                  {user.location && (
                    <p className="text-sm text-muted-foreground mb-3">
                      📍 {user.location}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">
                        {user.rating_average?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-muted-foreground">
                        ({user.rating_count || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-medium">{user.missions_completed || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Livello {getUserLevel(user.missions_completed || 0)}
                    </Badge>
                    {user.is_verified && (
                      <Badge variant="default">✓ Verificato</Badge>
                    )}
                  </div>
                  
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCatalog;
