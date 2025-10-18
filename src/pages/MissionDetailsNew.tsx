import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Clock, User, MessageSquare, Flag, Star, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EscrowWidget } from "@/components/missions/EscrowWidget";
import { ApplicationModal } from "@/components/missions/ApplicationModal";
import { ProofUploadWidget } from "@/components/missions/ProofUploadWidget";
import { ReportAbuseModal } from "@/components/safety/ReportAbuseModal";
import { cn } from "@/lib/utils";

interface Mission {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  duration_hours: number;
  status: 'open' | 'in_progress' | 'pending_completion' | 'completed' | 'cancelled';
  created_at: string;
  owner_id: string;
  runner_id: string | null;
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

const MissionDetailsNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"runner" | "owner" | "guest">("guest");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);

  const fetchMissionDetails = useCallback(async () => {
    if (!id || id.startsWith('fallback')) {
      toast({ 
        title: "Missione non disponibile", 
        description: "Questa missione non esiste o è stata rimossa",
        variant: "destructive" 
      });
      navigate('/missions');
      return;
    }

    try {
      const { data: missionData, error } = await supabase
        .from('missions')
        .select(`
          id, title, description, price, location, duration_hours, status, created_at, owner_id, runner_id,
          profiles!missions_owner_id_fkey(first_name, last_name, rating_average, rating_count, avatar_url, is_verified),
          mission_categories(name, icon)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (missionData) {
        setMission(missionData as Mission);
        
        if (!user) {
          setUserRole("guest");
        } else if (missionData.owner_id === user.id) {
          setUserRole("owner");
        } else {
          setUserRole("runner");
        }
      }
    } catch (error) {
      console.error('Error fetching mission:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli della missione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast, user]);

  useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  const handleApplicationSubmit = async (data: { message: string }) => {
    if (!user || !mission) return;
    
    try {
      const { error } = await supabase
        .from('missions')
        .update({ 
          runner_id: user.id,
          status: 'in_progress' 
        })
        .eq('id', mission.id);

      if (error) throw error;

      toast({
        title: "Candidatura inviata!",
        description: "Ti contatteremo presto",
      });
      
      await fetchMissionDetails();
      setShowApplicationModal(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la candidatura",
        variant: "destructive",
      });
    }
  };

  const handleProofComplete = async () => {
    toast({
      title: "Prova inviata!",
      description: "In attesa di approvazione",
    });
    setShowProofUpload(false);
    await fetchMissionDetails();
  };

  const handleReportSubmit = async () => {
    toast({
      title: "Segnalazione inviata",
      description: "La esamineremo entro 24 ore",
    });
    setShowReportModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas pb-6 lg:ml-64">
        <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur-lg border-b border-border-default">
          <div className="px-4 py-3">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 lg:ml-64">
        <Card className="p-8 text-center max-w-md">
          <MapPin className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Missione non trovata
          </h2>
          <p className="text-text-muted mb-6">
            La missione potrebbe essere stata rimossa.
          </p>
          <Button onClick={() => navigate('/missions')}>
            Torna alle missioni
          </Button>
        </Card>
      </div>
    );
  }

  const ownerName = `${mission.profiles.first_name} ${mission.profiles.last_name}`;
  const ownerInitials = `${mission.profiles.first_name?.[0] || ''}${mission.profiles.last_name?.[0] || ''}`;
  
  const getStatusBadge = () => {
    const configs = {
      open: { label: "Aperta", variant: "default" as const },
      in_progress: { label: "In corso", variant: "default" as const },
      pending_completion: { label: "In revisione", variant: "secondary" as const },
      completed: { label: "Completata", variant: "success" as const },
      cancelled: { label: "Annullata", variant: "destructive" as const }
    };
    return configs[mission.status] || configs.open;
  };

  const statusBadge = getStatusBadge();
  const completionSteps = [
    { label: "Aperta", done: true },
    { label: "Assegnata", done: ['in_progress', 'pending_completion', 'completed'].includes(mission.status) },
    { label: "In corso", done: ['in_progress', 'pending_completion', 'completed'].includes(mission.status) },
    { label: "Completata", done: mission.status === 'completed' }
  ];
  const progress = (completionSteps.filter(s => s.done).length / completionSteps.length) * 100;

  return (
    <>
      <div className="min-h-screen bg-canvas pb-6 lg:ml-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur-lg border-b border-border-default">
          <div className="px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/missions")}
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </Button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
          {/* Hero Card */}
          <Card className="p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border-brand-primary/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                {mission.mission_categories?.icon || '⭐'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h1 className="text-xl font-bold text-text-primary flex-1">
                    {mission.title}
                  </h1>
                  <Badge variant={statusBadge.variant} className="flex-shrink-0">
                    {statusBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted">{mission.mission_categories?.name}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Compenso</p>
                <p className="text-3xl font-bold text-brand-primary">€{mission.price.toFixed(2)}</p>
              </div>
              {mission.duration_hours && (
                <div className="text-right">
                  <p className="text-sm text-text-muted mb-1">Durata</p>
                  <p className="text-lg font-semibold text-text-primary">{mission.duration_hours}h</p>
                </div>
              )}
            </div>
          </Card>

          {/* Escrow Widget - Compact */}
          {mission.status !== 'open' && mission.status !== 'cancelled' && (
            <EscrowWidget
              amount={mission.price}
              status={
                mission.status === 'in_progress' ? 'in_progress' :
                mission.status === 'pending_completion' ? 'pending_release' :
                mission.status === 'completed' ? 'released' : 'reserved'
              }
              daysUntilAutoRelease={mission.status === 'pending_completion' ? 7 : undefined}
            />
          )}

          {/* Progress Timeline */}
          {mission.status !== 'open' && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Avanzamento</h3>
              <Progress value={progress} className="h-2 mb-3" />
              <div className="grid grid-cols-4 gap-2 text-center">
                {completionSteps.map((step, i) => (
                  <div key={i} className="space-y-1">
                    <CheckCircle2 className={cn(
                      "w-5 h-5 mx-auto",
                      step.done ? "text-success-500" : "text-neutral-300 dark:text-neutral-600"
                    )} />
                    <p className={cn(
                      "text-xs",
                      step.done ? "text-text-primary font-medium" : "text-text-muted"
                    )}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Owner Info */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Creatore</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={mission.profiles.avatar_url} />
                <AvatarFallback className="bg-brand-secondary/10 text-brand-secondary font-semibold">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-text-primary">{ownerName}</h4>
                  {mission.profiles.is_verified && (
                    <Badge variant="success" className="text-xs">Verificato</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
                  <span className="text-text-muted">
                    {mission.profiles.rating_average?.toFixed(1) || '5.0'} ({mission.profiles.rating_count || 0})
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Descrizione</h3>
            <p className="text-sm text-text-primary leading-relaxed">{mission.description}</p>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted mb-1">Località</p>
                  <p className="text-sm font-medium text-text-primary">{mission.location}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-text-muted mb-1">Durata</p>
                  <p className="text-sm font-medium text-text-primary">
                    {mission.duration_hours ? `${mission.duration_hours}h` : 'Flessibile'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Proof Upload Section */}
          {mission.status === 'in_progress' && userRole === 'runner' && showProofUpload && (
            <ProofUploadWidget
              missionId={mission.id}
              onComplete={handleProofComplete}
            />
          )}

          {/* Actions */}
          <div className="space-y-3">
            {userRole === "guest" && (
              <Card className="p-4 bg-info-500/5 border-info-500/20 text-center">
                <p className="text-sm text-text-muted mb-3">
                  Accedi per candidarti a questa missione
                </p>
                <Button onClick={() => navigate('/')} className="w-full">
                  Accedi o Registrati
                </Button>
              </Card>
            )}

            {userRole === "runner" && mission.status === "open" && (
              <>
                <Button
                  onClick={() => setShowApplicationModal(true)}
                  className="w-full h-12 bg-brand-primary text-white hover:bg-brand-primary/90 font-semibold"
                >
                  Candidati per questa missione
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => navigate(`/chat/${mission.id}`)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contatta
                  </Button>
                  <Button variant="outline" onClick={() => setShowReportModal(true)} className="text-error-500 border-error-500/20">
                    <Flag className="w-4 h-4 mr-2" />
                    Segnala
                  </Button>
                </div>
              </>
            )}

            {userRole === "runner" && mission.status === "in_progress" && !showProofUpload && (
              <Button
                onClick={() => setShowProofUpload(true)}
                className="w-full h-12 bg-success-500 text-white hover:bg-success-500/90 font-semibold"
              >
                Carica prova di completamento
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplicationModal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        missionTitle={mission.title}
        missionPrice={mission.price}
        missionLocation={mission.location}
        missionDuration={mission.duration_hours ? `${mission.duration_hours}h` : undefined}
        requirements={[
          { id: '1', text: 'Profilo completo', met: true },
          { id: '2', text: 'Email verificata', met: true }
        ]}
        onSubmit={handleApplicationSubmit}
      />

      <ReportAbuseModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        targetType="mission"
        targetId={mission.id}
        targetName={mission.title}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

export default MissionDetailsNew;
