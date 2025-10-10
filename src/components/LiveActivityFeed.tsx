import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  Star, 
  TrendingUp,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  type: 'mission_created' | 'mission_completed' | 'user_joined' | 'earnings';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchInitialActivities();
    setupRealtimeSubscription();
  }, []);

  const fetchInitialActivities = async () => {
    try {
      // Fetch recent missions
      const { data: missionsData } = await supabase
        .from('missions')
        .select(`
          id,
          title,
          price,
          status,
          created_at,
          completed_at,
          profiles!missions_owner_id_fkey(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const mockActivities: ActivityEvent[] = missionsData?.slice(0, 5).map((mission, index) => {
        const types: ActivityEvent['type'][] = ['mission_created', 'mission_completed', 'earnings'];
        const type = types[index % 3];
        
        return {
          id: mission.id + '-' + index,
          type,
          title: type === 'mission_created' 
            ? `Nuova missione: ${mission.title}` 
            : type === 'mission_completed'
            ? `Missione completata`
            : `Guadagno registrato`,
          description: type === 'mission_created'
            ? `€${mission.price} disponibili`
            : type === 'mission_completed'
            ? `${mission.profiles?.first_name} ha completato una missione`
            : `${mission.profiles?.first_name} ha guadagnato €${mission.price}`,
          amount: mission.price,
          timestamp: getRelativeTime(new Date(mission.created_at)),
          user: {
            name: `${mission.profiles?.first_name || ''} ${mission.profiles?.last_name || ''}`.trim(),
            avatar: mission.profiles?.avatar_url
          }
        };
      }) || [];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'missions'
      }, (payload: any) => {
        const newActivity: ActivityEvent = {
          id: payload.new.id,
          type: 'mission_created',
          title: `Nuova missione: ${payload.new.title}`,
          description: `€${payload.new.price} disponibili`,
          amount: payload.new.price,
          timestamp: 'Proprio ora',
          user: {
            name: 'Nuovo utente'
          }
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getRelativeTime = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s fa`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`;
    return `${Math.floor(seconds / 86400)}g fa`;
  };

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'mission_created':
        return <Briefcase className="w-4 h-4 text-primary" />;
      case 'mission_completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'user_joined':
        return <Users className="w-4 h-4 text-secondary" />;
      case 'earnings':
        return <DollarSign className="w-4 h-4 text-warning" />;
    }
  };

  const getEventColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'mission_created':
        return 'bg-primary/10 border-primary/20';
      case 'mission_completed':
        return 'bg-success/10 border-success/20';
      case 'user_joined':
        return 'bg-secondary/10 border-secondary/20';
      case 'earnings':
        return 'bg-warning/10 border-warning/20';
    }
  };

  return (
    <Card className="bg-card shadow-card border-0 overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          Live nella Community
        </h3>
        <Badge variant="secondary" className="text-xs">Tempo reale</Badge>
      </div>
      
      <div 
        className={cn(
          "max-h-80 overflow-y-auto scrollbar-thin",
          !isPaused && "activity-feed-scroll"
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="divide-y divide-border/50">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 hover:bg-muted/30 transition-smooth cursor-pointer animate-fade-in flex items-start gap-3"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                getEventColor(activity.type)
              )}>
                {getEventIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {activity.description}
                    </p>
                  </div>
                  {activity.amount && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs whitespace-nowrap">
                      €{activity.amount}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
