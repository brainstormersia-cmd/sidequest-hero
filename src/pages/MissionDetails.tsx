import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Clock, Euro, Star, MessageSquare, Flag, User, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [userRole] = useState<"runner" | "owner">("runner"); // Mock user role
  
  // Mock mission data
  const mission = {
    id: parseInt(id || "1"),
    title: "Consegna pacchi centro città",
    description: "Ritiro e consegna di 3 pacchi in zona centro città. I pacchi sono di dimensioni medie e non superano i 5kg ciascuno. Ritiro presso il nostro ufficio in Via Roma 15 e consegna presso 3 indirizzi diversi nel centro storico. Auto necessaria per gli spostamenti. Preferibile esperienza in consegne.",
    category: "Consegne",
    location: "Centro città - Via Roma 15",
    duration: "2-3 ore",
    price: 25,
    status: "open",
    owner: {
      name: "Marco Rossi",
      rating: 4.8,
      reviewCount: 34,
      avatar: "MR",
      verified: true
    },
    timeline: [
      { label: "Aperta", completed: true },
      { label: "In corso", completed: false, current: false },
      { label: "In attesa conferma", completed: false },
      { label: "Completata", completed: false }
    ],
    requirements: [
      "Auto propria necessaria",
      "Disponibilità mattutina (9-12)",
      "Esperienza in consegne preferibile"
    ],
    compensation: {
      base: 25,
      bonus: 5,
      total: 30
    }
  };

  const handleAcceptMission = () => {
    toast({
      title: "Missione accettata!",
      description: "Ti metteremo in contatto con il proprietario",
    });
    navigate(`/chat/${mission.owner.name.toLowerCase().replace(" ", "-")}`);
  };

  const handleContactOwner = () => {
    navigate(`/chat/${mission.owner.name.toLowerCase().replace(" ", "-")}`);
  };

  const handleReportMission = () => {
    toast({
      title: "Segnalazione inviata",
      description: "Esamineremo la tua segnalazione entro 24 ore",
      variant: "destructive",
    });
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
              onClick={() => navigate("/missions")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Dettagli missione</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Hero Section */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-foreground">{mission.title}</h1>
                <StatusBadge status={mission.status} />
              </div>
              <p className="text-sm text-muted-foreground">{mission.category}</p>
            </div>
          </div>
          
          <div className="text-center py-4 border-t border-border/50">
            <span className="text-3xl font-bold text-foreground">€{mission.compensation.total}</span>
            <p className="text-sm text-muted-foreground">
              Base €{mission.compensation.base} + Bonus €{mission.compensation.bonus}
            </p>
          </div>
        </Card>

        {/* Owner Info */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Proprietario</h3>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                {mission.owner.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{mission.owner.name}</h4>
                {mission.owner.verified && (
                  <Badge className="status-badge bg-success/10 text-success border-success/20 text-xs">
                    Verificato
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-current text-primary" />
                <span>{mission.owner.rating} ({mission.owner.reviewCount} recensioni)</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${mission.owner.name.toLowerCase().replace(" ", "-")}`)}
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
                <p className="text-sm text-muted-foreground">{mission.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Durata stimata</p>
                <p className="text-sm text-muted-foreground">{mission.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Euro className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Compenso</p>
                <p className="text-sm text-muted-foreground">
                  €{mission.compensation.base} base + €{mission.compensation.bonus} bonus performance
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Requisiti</h3>
          <ul className="space-y-2">
            {mission.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground">{req}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Timeline */}
        <Card className="p-4 bg-card shadow-card border-0">
          <h3 className="font-semibold text-foreground mb-3">Timeline missione</h3>
          <div className="space-y-3">
            {mission.timeline.map((step, index) => (
              <TimelineStep key={index} {...step} />
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {userRole === "runner" && mission.status === "open" ? (
            <>
              <Button
                onClick={handleAcceptMission}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold shadow-card transition-bounce hover:scale-[1.02]"
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
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11"
              >
                Gestisci missione
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;