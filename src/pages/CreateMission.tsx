import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Clock, Euro, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMapboxAutocomplete, type MapboxSuggestion } from "@/hooks/use-mapbox-autocomplete";

interface DraftMission {
  title: string;
  description: string;
  category: string;
  duration: string;
  location: string;
  price: string;
  latitude?: number | null;
  longitude?: number | null;
}

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <div
        key={index}
        className={`w-3 h-3 rounded-full transition-smooth ${
          index < currentStep ? "bg-primary" : "bg-muted"
        }`}
      />
    ))}
  </div>
);

const PreviewCard = ({ mission }: { mission: DraftMission }) => (
  <Card className="mission-card">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-semibold">
          {mission.category === "delivery" ? "🚛" : 
           mission.category === "pet" ? "🐕" : 
           mission.category === "shopping" ? "🛒" : 
           mission.category === "handyman" ? "🔨" : "👥"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-base line-clamp-1">{mission.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{mission.description}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        <span>{mission.location}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{mission.duration}</span>
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-foreground">€{mission.price}</span>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="text-secondary">
          Dettagli
        </Button>
        <Button size="sm" className="bg-primary text-primary-foreground">
          Accetta
        </Button>
      </div>
    </div>
  </Card>
);

const CreateMission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [mission, setMission] = useState<DraftMission>({
    title: "",
    description: "",
    category: "",
    duration: "",
    location: "",
    price: "",
    latitude: null,
    longitude: null
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedLocationQuery = locationQuery.trim();
  const { suggestions, isLoading: isLoadingSuggestions, error: locationError } = useMapboxAutocomplete(
    trimmedLocationQuery,
    {
      enabled: currentStep === 3 && trimmedLocationQuery.length >= 3,
    }
  );

  const handleSelectLocation = (suggestion: MapboxSuggestion) => {
    setMission((prev) => ({
      ...prev,
      location: suggestion.placeName,
      latitude: Number.isFinite(suggestion.latitude) ? suggestion.latitude : prev.latitude ?? null,
      longitude: Number.isFinite(suggestion.longitude) ? suggestion.longitude : prev.longitude ?? null,
    }));
    setLocationQuery(suggestion.placeName);
    setIsLocationFocused(false);
  };

  const categories = [
    { value: "delivery", label: "Consegne", icon: "🚛" },
    { value: "pet", label: "Pet sitting", icon: "🐕" },
    { value: "shopping", label: "Spesa e acquisti", icon: "🛒" },
    { value: "handyman", label: "Lavori domestici", icon: "🔨" },
    { value: "cleaning", label: "Pulizie", icon: "🧹" },
    { value: "moving", label: "Traslochi", icon: "📦" },
    { value: "other", label: "Altro", icon: "👥" }
  ];

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

  const handleSubmit = () => {
    if (!mission.title || !mission.description || !mission.category || !mission.duration || !mission.location || !mission.price) {
      toast({
        title: "Campi mancanti",
        description: "Completa tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Missione pubblicata!",
      description: "La tua missione è ora visibile agli altri utenti",
    });
    navigate("/missions");
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
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => currentStep > 1 ? handleBack() : navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Crea missione</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step 1: Title and Description */}
        {currentStep === 1 && (
          <Card className="p-6 bg-card shadow-card border-0">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Descrivi la tua missione</h2>
              <p className="text-muted-foreground">Sii chiaro e dettagliato per attirare i migliori runner</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Titolo missione *
                </Label>
                <Input
                  id="title"
                  value={mission.title}
                  onChange={(e) => setMission({ ...mission, title: e.target.value })}
                  placeholder="es. Consegna pacchi centro città"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrizione dettagliata *
                </Label>
                <Textarea
                  id="description"
                  value={mission.description}
                  onChange={(e) => setMission({ ...mission, description: e.target.value })}
                  placeholder="Spiega cosa deve fare il runner, includi tutti i dettagli importanti..."
                  className="mt-1 min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {mission.description.length}/500 caratteri
                </p>
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
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant={mission.category === category.value ? "default" : "outline"}
                      className="h-auto p-3 flex-col gap-2"
                      onClick={() => setMission({ ...mission, category: category.value })}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs text-center">{category.label}</span>
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
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={locationQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLocationQuery(value);
                      setMission({
                        ...mission,
                        location: value,
                        latitude: null,
                        longitude: null,
                      });
                    }}
                    onFocus={() => {
                      if (blurTimeout.current) {
                        clearTimeout(blurTimeout.current);
                        blurTimeout.current = null;
                      }
                      setIsLocationFocused(true);
                    }}
                    onBlur={() => {
                      blurTimeout.current = setTimeout(() => {
                        setIsLocationFocused(false);
                      }, 120);
                    }}
                    placeholder="es. Centro città, Via Roma 15"
                    className="mt-1 pl-10"
                  />
                  {(isLocationFocused || trimmedLocationQuery.length >= 3) && (
                    <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-popover shadow-lg">
                      {locationError && (
                        <p className="px-4 py-3 text-sm text-destructive">{locationError}</p>
                      )}
                      {!locationError && isLoadingSuggestions && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Caricamento suggerimenti...</span>
                        </div>
                      )}
                      {!locationError && !isLoadingSuggestions && trimmedLocationQuery.length < 3 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Digita almeno 3 caratteri per vedere i suggerimenti.
                        </p>
                      )}
                      {!locationError && !isLoadingSuggestions && trimmedLocationQuery.length >= 3 && suggestions.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Nessun risultato trovato. Prova a essere più specifico.
                        </p>
                      )}
                      {!locationError && suggestions.length > 0 && (
                        <ul className="max-h-64 overflow-y-auto py-1">
                          {suggestions.map((suggestion) => (
                            <li key={suggestion.id}>
                              <button
                                type="button"
                                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/60 focus:bg-muted/80 focus:outline-none"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleSelectLocation(suggestion);
                                }}
                              >
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-sm text-foreground">
                                  {suggestion.primaryText}
                                  {suggestion.secondaryText && (
                                    <span className="block text-xs text-muted-foreground">
                                      {suggestion.secondaryText}
                                    </span>
                                  )}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
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
              
              <PreviewCard mission={{
                ...mission,
                price: parseFloat(mission.price) || 0
              }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Indietro
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Avanti
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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