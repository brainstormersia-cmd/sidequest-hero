import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MissionCardV2 } from "@/components/MissionCardV2";
import { ArrowLeft, MapPin, Clock, Euro, Eye, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DraftMission {
  title: string;
  description: string;
  category: string;
  duration: string;
  location: string;
  price: string;
}

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-8">
      <Progress value={progress} className="h-2 mb-4" />
      <div className="flex justify-between">
        {[...Array(totalSteps)].map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-smooth",
                isCompleted && "bg-success-500 text-white",
                isCurrent && "bg-brand-primary text-white ring-4 ring-brand-primary/20",
                !isCompleted && !isCurrent && "bg-surface border-2 border-border-default text-text-muted"
              )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>
              <span className={cn(
                "text-xs font-medium",
                (isCompleted || isCurrent) ? "text-text-primary" : "text-text-muted"
              )}>
                {stepNum === 1 ? "Info" : stepNum === 2 ? "Dettagli" : stepNum === 3 ? "Luogo" : "Conferma"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PreviewCard = ({ mission }: { mission: DraftMission }) => {
  const categoryEmojis: Record<string, string> = {
    delivery: "🚛",
    pet: "🐕",
    shopping: "🛒",
    handyman: "🔨",
    cleaning: "✨",
    moving: "📦",
  };

  return (
    <MissionCardV2
      title={mission.title || "Titolo missione"}
      description={mission.description || "Descrizione della missione"}
      price={parseFloat(mission.price) || 0}
      escrowAmount={parseFloat(mission.price) || 0}
      isKYCVerified={true}
      location={mission.location || "Località"}
      deadline={mission.duration}
      category={mission.category as any}
      onAccept={() => {}}
    />
  );
};

const CreateMission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [mission, setMission] = useState<DraftMission>({
    title: "",
    description: "",
    category: "",
    duration: "",
    location: "",
    price: ""
  });

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ['mission-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mission_categories')
        .select('id, name, icon')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const durations = [
    { value: "30min", label: "30 minuti" },
    { value: "1h", label: "1 ora" },
    { value: "2h", label: "1-2 ore" },
    { value: "3h", label: "2-3 ore" },
    { value: "halfday", label: "Mezza giornata" },
    { value: "fullday", label: "Giornata intera" },
    { value: "multiday", label: "Più giorni" }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ 
        title: "Autenticazione richiesta", 
        description: "Devi essere loggato per creare una missione",
        variant: "destructive" 
      });
      navigate('/login?next=/create-mission');
      return;
    }

    if (!mission.title || !mission.description || !mission.category || 
        !mission.duration || !mission.location || !mission.price) {
      toast({
        title: "Campi mancanti",
        description: "Completa tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find category_id by name
      const { data: categoryData } = await supabase
        .from('mission_categories')
        .select('id')
        .eq('id', mission.category)
        .maybeSingle();

      const categoryId = categoryData?.id || null;

      // Convert duration to hours
      const durationMap: Record<string, number> = {
        '30min': 0.5, '1h': 1, '2h': 2, '3h': 3,
        'halfday': 4, 'fullday': 8, 'multiday': 16
      };
      const durationHours = durationMap[mission.duration] || 1;

      // Insert mission
      const { data: newMission, error: insertError } = await supabase
        .from('missions')
        .insert({
          owner_id: user.id,
          title: mission.title,
          description: mission.description,
          category_id: categoryId,
          location: mission.location,
          price: parseFloat(mission.price),
          duration_hours: durationHours,
          status: 'open'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Invalidate queries to update lists
      await queryClient.invalidateQueries({ queryKey: ['missions'] });
      await queryClient.invalidateQueries({ queryKey: ['recommended-missions'] });

      toast({ 
        title: "✅ Missione pubblicata!", 
        description: "La tua missione è ora visibile nel catalogo" 
      });
      
      navigate(`/missions/${newMission.id}`);
    } catch (error) {
      console.error('Error creating mission:', error);
      toast({ 
        title: "Errore", 
        description: "Impossibile pubblicare la missione. Riprova.", 
        variant: "destructive" 
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return mission.title && mission.description;
      case 2:
        return mission.category && mission.duration;
      case 3:
        return mission.location;
      case 4:
        return mission.price;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-20 lg:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-canvas/95 backdrop-blur-lg border-b border-border-default">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => currentStep > 1 ? handleBack() : navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep > 1 ? "Indietro" : "Esci"}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Crea una nuova missione</h1>
          <p className="text-sm text-text-muted">
            Step {currentStep} di {totalSteps}
          </p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step 1: Title and Description */}
        {currentStep === 1 && (
          <Card className="p-6 bg-surface shadow-elegant">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Descrivi la tua missione</h2>
              <p className="text-sm text-text-muted">Sii chiaro e dettagliato per attirare i migliori runner</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-text-primary mb-2 block">
                  Titolo missione *
                </Label>
                <Input
                  id="title"
                  value={mission.title}
                  onChange={(e) => setMission({ ...mission, title: e.target.value })}
                  placeholder="es. Consegna pacchi centro città"
                  className="h-11"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-text-primary mb-2 block">
                  Descrizione dettagliata *
                </Label>
                <Textarea
                  id="description"
                  value={mission.description}
                  onChange={(e) => setMission({ ...mission, description: e.target.value })}
                  placeholder="Spiega cosa deve fare il runner, includi tutti i dettagli importanti..."
                  className="min-h-[140px] resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-text-muted">
                    {mission.description.length}/500 caratteri
                  </p>
                  {mission.description.length > 400 && (
                    <span className="text-xs text-warning-500">Quasi al limite</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Category and Duration */}
        {currentStep === 2 && (
          <Card className="p-6 bg-card shadow-card border-0">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Categoria e durata</h2>
              <p className="text-muted-foreground">Aiuta i runner a capire che tipo di lavoro è</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Categoria *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant={mission.category === category.id ? "default" : "outline"}
                      className="h-auto p-3 flex-col gap-2"
                      onClick={() => setMission({ ...mission, category: category.id })}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs text-center">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">
                  Durata stimata *
                </Label>
                <Select value={mission.duration} onValueChange={(value) => setMission({ ...mission, duration: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleziona durata" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <Card className="p-6 bg-card shadow-card border-0">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Dove si svolge?</h2>
              <p className="text-muted-foreground">Specifica la zona o l'indirizzo esatto</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Località *
                </Label>
                <div className="mt-1">
                  <LocationAutocomplete
                    value={mission.location}
                    onChange={(value) => setMission({ ...mission, location: value })}
                    placeholder="es. Via Roma, Milano"
                  />
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">Suggerimento</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Più sei preciso, più è facile per i runner trovare e accettare la tua missione. 
                      Puoi anche includere punti di riferimento noti.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Price and Preview */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card className="p-6 bg-card shadow-card border-0">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Imposta il compenso</h2>
                <p className="text-muted-foreground">Quanto vuoi pagare per questa missione?</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Prezzo (€) *
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={mission.price}
                      onChange={(e) => setMission({ ...mission, price: e.target.value })}
                      placeholder="0"
                      className="mt-1 pl-10 text-lg font-semibold"
                      min="1"
                      step="0.5"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Commissione SideQuest: 5% (€{mission.price ? (parseFloat(mission.price) * 0.05).toFixed(2) : "0.00"})
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium text-foreground text-sm mb-2">💡 Suggerimenti prezzo</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Consegne: €15-30 a seconda della distanza</li>
                    <li>• Pet sitting: €20-60 al giorno</li>
                    <li>• Spesa: €10-20 per famiglia</li>
                    <li>• Lavori casa: €25-50 per ora</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Anteprima della tua missione</h3>
              </div>
              
              <PreviewCard mission={mission} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12"
            >
              Indietro
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 h-12 bg-brand-primary text-white hover:bg-brand-primary/90 font-semibold"
            >
              Continua
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex-1 h-12 bg-success-500 text-white hover:bg-success-500/90 font-semibold"
            >
              Pubblica missione
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMission;