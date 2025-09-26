import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Clock, Star, Truck, Dog, ShoppingCart, Hammer, Users, Plus } from "lucide-react";

const categoryIcons = {
  delivery: Truck,
  pet: Dog,
  shopping: ShoppingCart,
  handyman: Hammer,
  other: Users
};

const MissionCard = ({ 
  id,
  title, 
  description, 
  category, 
  location, 
  duration, 
  price, 
  ownerRating,
  ownerName 
}: { 
  id: number;
  title: string; 
  description: string; 
  category: keyof typeof categoryIcons;
  location: string; 
  duration: string; 
  price: number; 
  ownerRating: number;
  ownerName: string;
}) => {
  const navigate = useNavigate();
  const IconComponent = categoryIcons[category];
  
  return (
    <Card className="mission-card">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          <span>{ownerRating} • {ownerName}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-foreground">€{price}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-secondary hover:text-secondary/80 px-3"
            onClick={() => navigate(`/missions/${id}`)}
          >
            Dettagli
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
            onClick={() => navigate(`/missions/${id}`)}
          >
            Accetta
          </Button>
        </div>
      </div>
    </Card>
  );
};

const FilterChip = ({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
}) => (
  <Badge
    variant={active ? "default" : "outline"}
    className={`cursor-pointer transition-bounce hover:scale-105 ${
      active 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-transparent text-muted-foreground hover:bg-muted border-border"
    }`}
    onClick={onClick}
  >
    {label}
  </Badge>
);

const Missions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "Tutte" },
    { id: "delivery", label: "Consegne" },
    { id: "pet", label: "Pet sitting" },
    { id: "shopping", label: "Spesa" },
    { id: "handyman", label: "Lavori" }
  ];

  const missions = [
    {
      id: 1,
      title: "Consegna pacchi centro città",
      description: "Ritiro e consegna di 3 pacchi in zona centro. Auto necessaria per gli spostamenti.",
      category: "delivery" as const,
      location: "Centro",
      duration: "2-3h",
      price: 25,
      ownerRating: 4.8,
      ownerName: "Marco"
    },
    {
      id: 2,
      title: "Dog sitting per il weekend",
      description: "Accudire Milo, un golden retriever di 3 anni, per il fine settimana. Molto socievole.",
      category: "pet" as const,
      location: "Porta Romana",
      duration: "2 giorni",
      price: 60,
      ownerRating: 4.9,
      ownerName: "Sofia"
    },
    {
      id: 3,
      title: "Spesa settimanale",
      description: "Fare la spesa per famiglia di 4 persone. Lista dettagliata fornita.",
      category: "shopping" as const,
      location: "Isola",
      duration: "1-2h",
      price: 15,
      ownerRating: 4.6,
      ownerName: "Anna"
    },
    {
      id: 4,
      title: "Montaggio mobile IKEA",
      description: "Montare libreria e scrivania IKEA. Attrezzi forniti, serve solo manodopera.",
      category: "handyman" as const,
      location: "Navigli",
      duration: "3-4h",
      price: 40,
      ownerRating: 4.7,
      ownerName: "Luca"
    },
    {
      id: 5,
      title: "Supporto trasloco",
      description: "Aiuto per carico e scarico durante trasloco. Forza fisica richiesta.",
      category: "other" as const,
      location: "Lambrate",
      duration: "4-5h",
      price: 35,
      ownerRating: 4.5,
      ownerName: "Giuseppe"
    }
  ];

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || mission.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Missioni disponibili</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca missioni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus:bg-card transition-smooth"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
        </div>

        {/* Mission Cards */}
        <div className="space-y-4">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((mission) => (
              <MissionCard key={mission.id} {...mission} />
            ))
          ) : (
            <Card className="p-8 text-center bg-card shadow-card border-0">
              <div className="text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nessuna missione trovata</p>
                <p className="text-sm">Prova a modificare i filtri o la ricerca</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="floating-button"
        onClick={() => navigate("/create-mission")}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Missions;