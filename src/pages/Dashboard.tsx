import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MessageSquare, Briefcase, Bell, Wallet, User, MapPin, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuickAction = ({ 
  icon, 
  label, 
  onClick, 
  variant = "default" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  variant?: "default" | "primary";
}) => (
  <Card 
    className={`p-4 cursor-pointer transition-bounce hover:scale-[1.02] active:scale-95 ${
      variant === "primary" ? "bg-primary text-primary-foreground shadow-floating" : "bg-card shadow-card"
    }`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  </Card>
);

const StatCard = ({ 
  title, 
  value, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
}) => (
  <Card className="p-4 bg-gradient-card border-0 shadow-card">
    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    <p className="text-sm font-medium text-foreground">{title}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </Card>
);

const NotificationItem = ({ 
  title, 
  description, 
  time 
}: { 
  title: string; 
  description: string; 
  time: string; 
}) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth cursor-pointer">
    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletBalance] = useState(127.50);

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      label: "Crea missione",
      onClick: () => navigate("/create-mission"),
      variant: "primary" as const
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Missioni",
      onClick: () => navigate("/missions")
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: "Messaggi",
      onClick: () => navigate("/chat")
    }
  ];

  const recentNotifications = [
    {
      title: "Nuova missione disponibile",
      description: "Consegna pacchi zona Centro - €25",
      time: "5 min fa"
    },
    {
      title: "Missione completata",
      description: "Hai guadagnato €15 per la spesa",
      time: "2 ore fa"
    },
    {
      title: "Nuovo messaggio",
      description: "Marco ti ha inviato un messaggio",
      time: "1 giorno fa"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Benvenuto, Runner!</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="wallet-pill">
                <Wallet className="w-4 h-4 inline mr-2" />
                €{walletBalance.toFixed(2)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-24">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Azioni rapide</h2>
          <div className="grid grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Le tue statistiche</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Missioni create"
              value={8}
              subtitle="Questo mese"
            />
            <StatCard
              title="Missioni accettate"
              value={12}
              subtitle="Completate: 10"
            />
            <StatCard
              title="Rating medio"
              value="4.8"
              subtitle="⭐ Ottimo lavoro!"
            />
          </div>
        </section>

        {/* Recent Notifications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Aggiornamenti recenti</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/notifications")}
              className="text-primary hover:text-primary/80"
            >
              Vedi tutto
            </Button>
          </div>
          <Card className="p-2 bg-card shadow-card border-0">
            <div className="space-y-1">
              {recentNotifications.map((notification, index) => (
                <NotificationItem key={index} {...notification} />
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;