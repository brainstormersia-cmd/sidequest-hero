import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Euro, Star, MessageSquare, Flag, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Mission {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  street?: string;
  street_number?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  lat?: number;
  lon?: number;
  duration_hours: number;
  status: 'open' | 'in_progress' | 'pending_completion' | 'completed' | 'cancelled';
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    rating_average: number;
    rating_count: number;
    avatar_url?: string;
    is_verified: boolean;
  };
  mission_categories: {
    name: string;
    icon: string;
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    open: { label: "Aperta", className: "status-open" },
    progress: { label: "In corso", className: "status-progress" },
    pending: { label: "In attesa", className: "status-badge bg-warning/10 text-warning border-warning/20" },
    completed: { label: "Completata", className: "status-completed" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
  
  return (
    <Badge className={`status-badge ${config.className}`}>
      {config.label}
    </Badge>
  );
};

const TimelineStep = ({ 
  label, 
  completed, 
  current = false 
}: { 
  label: string; 
  completed: boolean; 
  current?: boolean; 
}) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${
      completed 
        ? "bg-success" 
        : current 
          ? "bg-primary" 
          : "bg-muted border-2 border-muted-foreground"
    }`} />
    <span className={`text-sm ${
      completed || current ? "text-foreground font-medium" : "text-muted-foreground"
    }`}>
      {label}
    </span>
  </div>
);

const MissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"runner" | "owner" | "guest">("guest");

  const fetchMissionDetails = useCallback(async () => {
    try {
      const { data: missionData, error } = await supabase
        .from('missions')
        .select(`
          id,
          title,
          description,
          price,
          location,
          street,
          street_number,
          city,
          province,
          postal_code,
          country,
          lat,
          lon,
          duration_hours,
          status,
          created_at,
          owner_id,
          runner_id,
          profiles!missions_owner_id_fkey(
            first_name,
            last_name,
            rating_average,
            rating_count,
            avatar_url,
            is_verified
          ),
          mission_categories(
            name,
            icon
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching mission:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dettagli della missione",
          variant: "destructive",
        });
        navigate('/missions');
        return;
      }

      if (missionData) {
        setMission(missionData as Mission);
        
        // Determine user role
        if (!user) {
          setUserRole("guest");
        } else if (missionData.owner_id === user.id) {
          setUserRole("owner");
        } else {
          setUserRole("runner");
        }
      }
    } catch (error) {
      console.error('Error fetching mission details:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast, user]);

  useEffect(() => {
    if (!id) {
      navigate('/missions');
      return;
    }

    fetchMissionDetails();
  }, [fetchMissionDetails, id, navigate]);

  const handleAcceptMission = async () => {
    if (!user || !mission) return;
    
    try {
      const { error } = await supabase
        .from('missions')
        .update({ 
          runner_id: user.id,
          status: 'in_progress' 
        })
        .eq('id', mission.id);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile accettare la missione",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Missione accettata!",
        description: "Ti metteremo in contatto con il proprietario",
      });
      
      // Refresh mission data
      await fetchMissionDetails();
      
      // Navigate to chat
      navigate(`/chat/${mission.id}`);
    } catch (error) {
      console.error('Error accepting mission:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore",
        variant: "destructive",
      });
    }
  };

  const handleContactOwner = () => {
    if (!mission) return;
    navigate(`/chat/${mission.id}`);
  };

  const handleReportMission = () => {
    toast({
      title: "Segnalazione inviata",
      description: "Esamineremo la tua segnalazione entro 24 ore",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-6">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate("/missions")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Missione non trovata
          </h2>
          <p className="text-muted-foreground mb-6">
            La missione che stai cercando potrebbe essere stata rimossa o non esistere.
          </p>
          <Button onClick={() => navigate('/missions')}>
            Torna alle missioni
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      open: { label: "Aperta", className: "status-open" },
      in_progress: { label: "In corso", className: "status-progress" },
      pending_completion: { label: "In attesa", className: "status-badge bg-warning/10 text-warning border-warning/20" },
      completed: { label: "Completata", className: "status-completed" },
      cancelled: { label: "Annullata", className: "status-badge bg-destructive/10 text-destructive border-destructive/20" }
    };
    return configs[status as keyof typeof configs] || configs.open;
  };

  const getTimelineSteps = (status: string) => {
    return [
      { label: "Aperta", completed: true },
      { label: "In corso", completed: ['in_progress', 'pending_completion', 'completed'].includes(status), current: status === 'in_progress' },
      { label: "In attesa conferma", completed: ['pending_completion', 'completed'].includes(status), current: status === 'pending_completion' },
      { label: "Completata", completed: status === 'completed', current: false }
    ];
  };

  const ownerName = `${mission.profiles.first_name} ${mission.profiles.last_name}`;
  const ownerInitials = `${mission.profiles.first_name?.[0] || ''}${mission.profiles.last_name?.[0] || ''}`;
  const statusConfig = getStatusConfig(mission.status);
  const timelineSteps = getTimelineSteps(mission.status);

  return (
    <div className="min-h-screen bg-background lg:ml-64 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={() => navigate("/missions")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Dettagli missione</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-card">
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">{mission.mission_categories?.icon || '⭐'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1 sm:mb-2">
                <h1 className="text-base sm:text-xl font-bold text-foreground flex-1 line-clamp-2">{mission.title}</h1>
                <Badge className={`status-badge ${statusConfig.className} flex-shrink-0 text-xs`}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{mission.mission_categories?.name}</p>
            </div>
          </div>
          
          <div className="text-center py-3 sm:py-4 border-t border-border/50">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">€{mission.price}</span>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {mission.duration_hours ? `~${mission.duration_hours}h di lavoro` : 'Durata da concordare'}
            </p>
          </div>
        </Card>

        {/* Owner Info */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Proprietario</h3>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={mission.profiles.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{ownerName}</h4>
                {mission.profiles.is_verified && (
                  <Badge className="status-badge bg-success/10 text-success border-success/20 text-xs">
                    Verificato
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-current text-primary" />
                <span>
                  {mission.profiles.rating_average?.toFixed(1) || '5.0'} 
                  ({mission.profiles.rating_count || 0} recensioni)
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profilo
            </Button>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Descrizione</h3>
          <p className="text-sm text-foreground leading-relaxed">{mission.description}</p>
        </Card>

        {/* Info Details */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Informazioni pratiche</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Ubicazione</p>
                {mission.street ? (
                  <>
                    <p className="text-sm text-foreground">
                      {mission.street} {mission.street_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mission.postal_code} {mission.city} {mission.province && `(${mission.province})`}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{mission.location}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Durata stimata</p>
                <p className="text-sm text-muted-foreground">
                  {mission.duration_hours ? `${mission.duration_hours} ore` : 'Da concordare'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Euro className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Compenso</p>
                <p className="text-sm text-muted-foreground">
                  €{mission.price} totale
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Timeline missione</h3>
          <div className="space-y-3">
            {timelineSteps.map((step, index) => (
              <TimelineStep key={index} {...step} />
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {userRole === "guest" ? (
            <Card className="p-4 bg-primary/5 border-primary/20 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Accedi per interagire con questa missione
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Accedi o Registrati
              </Button>
            </Card>
          ) : userRole === "runner" && mission.status === "open" ? (
            <>
              <Button
                onClick={handleAcceptMission}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-card transition-bounce hover:scale-[1.02] touch-manipulation"
              >
                Accetta missione
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleContactOwner}
                  className="h-11"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contatta
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReportMission}
                  className="h-11 text-destructive border-destructive/20 hover:bg-destructive/5"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Segnala
                </Button>
              </div>
            </>
          ) : userRole === "owner" ? (
            <div className="grid grid-cols-1 gap-3">
              <Button
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11"
                onClick={() => toast({
                  title: "Gestione missione in arrivo",
                  description: "Stiamo ultimando il pannello di gestione per i creator.",
                })}
              >
                Gestisci missione
              </Button>
              {mission.status !== 'open' && (
                <Button
                  variant="outline"
                  onClick={handleContactOwner}
                  className="h-11"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat con Runner
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleContactOwner}
                className="h-11"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button
                variant="outline"
                onClick={handleReportMission}
                className="h-11 text-destructive border-destructive/20 hover:bg-destructive/5"
              >
                <Flag className="w-4 h-4 mr-2" />
                Segnala
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;