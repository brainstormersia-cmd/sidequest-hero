import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Star, MapPin, Calendar, Briefcase, CheckCircle, LogOut, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LevelBadge } from "@/components/LevelBadge";
import { AchievementCard } from "@/components/AchievementCard";
import { getUserLevel, checkAchievements } from "@/lib/gamification";

const ReviewCard = ({ 
  reviewer, 
  rating, 
  comment, 
  mission, 
  date 
}: { 
  reviewer: string; 
  rating: number; 
  comment: string; 
  mission: string; 
  date: string; 
}) => (
  <Card className="p-4 bg-card shadow-card border-0">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
            {reviewer.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-foreground text-sm">{reviewer}</h4>
          <p className="text-xs text-muted-foreground">{mission}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < rating ? "fill-current text-primary" : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        <span className="text-muted-foreground ml-1">{rating}</span>
      </div>
    </div>
    <p className="text-sm text-foreground leading-relaxed mb-2">{comment}</p>
    <p className="text-xs text-muted-foreground">{date}</p>
  </Card>
);

const MissionCard = ({ 
  title, 
  status, 
  price, 
  date, 
  category 
}: { 
  title: string; 
  status: "completed" | "in-progress" | "created";
  price: number; 
  date: string; 
  category: string; 
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="status-completed">Completata</Badge>;
      case "in-progress":
        return <Badge className="status-progress">In corso</Badge>;
      case "created":
        return <Badge className="status-open">Pubblicata</Badge>;
    }
  };

  return (
    <Card className="p-4 bg-card shadow-card border-0 hover:shadow-floating transition-smooth cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground line-clamp-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        {getStatusBadge()}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{date}</span>
        <span className="font-semibold text-foreground">€{price}</span>
      </div>
    </Card>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const user = {
    name: "Alessandro Runner",
    email: "alessandro@example.com",
    phone: "+39 333 123 4567",
    avatar: "AR",
    rating: 4.8,
    reviewCount: 24,
    joinDate: "Marzo 2024",
    location: "Milano, Italia",
    verified: true,
    bio: "Runner esperto con oltre 2 anni di esperienza in consegne e lavoretti vari. Affidabile, puntuale e sempre disponibile ad aiutare.",
    stats: {
      missionsCreated: 8,
      missionsCompleted: 24,
      totalEarnings: 850
    }
  };

  const reviews = [
    {
      reviewer: "Marco Rossi",
      rating: 5,
      comment: "Ottimo lavoro! Puntuale e professionale. Ha gestito la consegna perfettamente e ha mantenuto la comunicazione durante tutto il processo.",
      mission: "Consegna pacchi centro",
      date: "2 giorni fa"
    },
    {
      reviewer: "Sofia Bianchi",
      rating: 5,
      comment: "Milo si è trovato benissimo! Alessandro è stato attento e premuroso. Sicuramente lo contatterò di nuovo.",
      mission: "Dog sitting weekend",
      date: "1 settimana fa"
    },
    {
      reviewer: "Anna Verdi",
      rating: 4,
      comment: "Spesa fatta bene, ha rispettato tutte le richieste. Unico piccolo ritardo ma ha avvisato subito.",
      mission: "Spesa settimanale",
      date: "2 settimane fa"
    }
  ];

  const createdMissions = [
    {
      title: "Aiuto trasloco weekend",
      status: "completed" as const,
      price: 80,
      date: "1 settimana fa",
      category: "Traslochi"
    },
    {
      title: "Montaggio mobile IKEA",
      status: "in-progress" as const,
      price: 40,
      date: "3 giorni fa",
      category: "Lavori casa"
    }
  ];

  const completedMissions = [
    {
      title: "Consegna pacchi centro città",
      status: "completed" as const,
      price: 25,
      date: "2 giorni fa",
      category: "Consegne"
    },
    {
      title: "Dog sitting Milo",
      status: "completed" as const,
      price: 60,
      date: "1 settimana fa",
      category: "Pet sitting"
    },
    {
      title: "Spesa famiglia Verdi",
      status: "completed" as const,
      price: 15,
      date: "2 settimane fa",
      category: "Spesa"
    }
  ];

  const userLevel = getUserLevel(user.stats.missionsCompleted);
  const achievements = checkAchievements({
    missions_completed: user.stats.missionsCompleted,
    total_earnings: user.stats.totalEarnings,
    rating_average: user.rating
  });

  const handleLogout = () => {
    toast({
      title: "Logout effettuato",
      description: "Alla prossima!",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background lg:ml-64 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">Profilo</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => toast({
                title: "Funzione in arrivo",
                description: "La modifica del profilo sarà disponibile a breve.",
              })}
            >
              <Edit className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6 bg-gradient-card border-0 shadow-card">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              {user.verified && (
                <CheckCircle className="w-6 h-6 text-success" />
              )}
            </div>
            
            {/* Level Badge */}
            <div className="flex justify-center mb-3">
              <LevelBadge
                currentLevel={userLevel.name}
                nextLevel={getUserLevel(user.stats.missionsCompleted + 1).name !== userLevel.name ? getUserLevel(user.stats.missionsCompleted + 1).name : 'Livello Massimo'}
                progress={((user.stats.missionsCompleted % 30) / 30) * 100}
                perks={userLevel.perks}
                compact
              />
            </div>
            
            <div className="flex items-center justify-center gap-1 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(user.rating) ? "fill-current text-primary" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground ml-1">
                {user.rating} ({user.reviewCount} recensioni)
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Dal {user.joinDate}</span>
              </div>
            </div>
            
            <p className="text-sm text-foreground leading-relaxed max-w-md mx-auto">
              {user.bio}
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-card shadow-card border-0">
            <p className="text-2xl font-bold text-foreground">{user.stats.missionsCreated}</p>
            <p className="text-sm text-muted-foreground">Create</p>
          </Card>
          <Card className="p-4 text-center bg-card shadow-card border-0">
            <p className="text-2xl font-bold text-foreground">{user.stats.missionsCompleted}</p>
            <p className="text-sm text-muted-foreground">Completate</p>
          </Card>
          <Card className="p-4 text-center bg-card shadow-card border-0">
            <p className="text-2xl font-bold text-success">€{user.stats.totalEarnings}</p>
            <p className="text-sm text-muted-foreground">Guadagnati</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl">
            <TabsTrigger value="reviews" className="rounded-lg text-xs">⭐ Recensioni</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg text-xs">🏆 Obiettivi</TabsTrigger>
            <TabsTrigger value="created" className="rounded-lg text-xs">📝 Create</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs">✅ Completate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="mt-6 space-y-4">
            {reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(achievement => (
                <AchievementCard key={achievement.id} {...achievement} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="created" className="mt-6 space-y-4">
            {createdMissions.map((mission, index) => (
              <MissionCard key={index} {...mission} />
            ))}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedMissions.map((mission, index) => (
              <MissionCard key={index} {...mission} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => toast({
              title: "Funzione in arrivo",
              description: "Presto potrai modificare il tuo profilo da qui.",
            })}
          >
            <Edit className="w-5 h-5 mr-2" />
            Modifica profilo
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-12 text-base text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;