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
      <div className="min-h-screen bg-canvas pb-20 lg:ml-64">
        {/* Minimal Header */}
        <div className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-xl border-b border-border-default/50">
          <div className="px-4 py-2 flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 -ml-2 text-text-muted hover:text-text-primary"
              onClick={() => navigate("/missions")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Missioni</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportModal(true)}
              className="text-text-muted hover:text-text-primary -mr-2"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto animate-fade-in">
          {/* Hero Section - Fluid */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl border border-brand-primary/10">
                {mission.mission_categories?.icon || '⭐'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-text-primary flex-1 leading-tight">
                    {mission.title}
                  </h1>
                  <Badge variant={statusBadge.variant} className="text-xs flex-shrink-0">
                    {statusBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted mb-3">{mission.mission_categories?.name}</p>
                
                {/* Inline Details */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MapPin className="w-4 h-4" />
                    <span>{mission.location}</span>
                  </div>
                  {mission.duration_hours && (
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock className="w-4 h-4" />
                      <span>{mission.duration_hours}h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compensation - Prominent but clean */}
            <Card className="p-4 bg-gradient-to-r from-success-500/5 to-brand-primary/5 border-success-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Compenso garantito</p>
                  <p className="text-3xl font-bold text-success-600 dark:text-success-400">€{mission.price.toFixed(2)}</p>
                </div>
                {mission.status !== 'open' && mission.status !== 'cancelled' && (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-500/10 text-success-700 dark:text-success-300">
                      <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                      <span className="text-xs font-medium">Protetto</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Progress Timeline - Only when relevant */}
          {mission.status !== 'open' && mission.status !== 'cancelled' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Avanzamento</h3>
                <span className="text-xs text-text-muted">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 mb-4" />
              <div className="flex items-center justify-between">
                {completionSteps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      step.done 
                        ? "bg-success-500 text-white shadow-sm" 
                        : "bg-surface border-2 border-border-default"
                    )}>
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-border-default" />
                      )}
                    </div>
                    <p className={cn(
                      "text-xs text-center",
                      step.done ? "text-text-primary font-medium" : "text-text-muted"
                    )}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description - Clean */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Descrizione</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{mission.description}</p>
          </div>

          {/* Owner Info - Inline */}
          <Card className="p-4 hover:bg-surface-hover transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 border-2 border-border-default">
                <AvatarImage src={mission.profiles.avatar_url} />
                <AvatarFallback className="bg-brand-secondary/10 text-brand-secondary font-semibold text-sm">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-medium text-text-primary text-sm">{ownerName}</h4>
                  {mission.profiles.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-warning-500 text-warning-500" />
                  <span className="text-xs text-text-muted">
                    {mission.profiles.rating_average?.toFixed(1) || '5.0'} · {mission.profiles.rating_count || 0} recensioni
                  </span>
                </div>
              </div>
              <User className="w-4 h-4 text-text-muted flex-shrink-0" />
            </div>
          </Card>

          {/* Proof Upload Section */}
          {mission.status === 'in_progress' && userRole === 'runner' && showProofUpload && (
            <ProofUploadWidget
              missionId={mission.id}
              onComplete={handleProofComplete}
            />
          )}
        </div>

        {/* Bottom Actions - Fixed, non-intrusive */}
        {(userRole === "guest" || (userRole === "runner" && mission.status === "open") || 
          (userRole === "runner" && mission.status === "in_progress" && !showProofUpload)) && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-canvas/95 backdrop-blur-xl border-t border-border-default z-20">
            <div className="px-4 py-3 max-w-3xl mx-auto">
              {userRole === "guest" && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-text-muted mb-0.5">Accedi per candidarti</p>
                    <p className="text-sm font-medium text-text-primary">Inizia ora</p>
                  </div>
                  <Button onClick={() => navigate('/')} size="sm" className="px-6">
                    Accedi
                  </Button>
                </div>
              )}

              {userRole === "runner" && mission.status === "open" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/chat/${mission.id}`)}
                    className="flex-shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowApplicationModal(true)}
                    size="sm"
                    className="flex-1 font-medium"
                  >
                    Candidati
                  </Button>
                </div>
              )}

              {userRole === "runner" && mission.status === "in_progress" && !showProofUpload && (
                <Button
                  onClick={() => setShowProofUpload(true)}
                  size="sm"
                  className="w-full bg-success-500 hover:bg-success-600 text-white font-medium"
                >
                  Carica completamento
                </Button>
              )}
            </div>
          </div>
        )}
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
