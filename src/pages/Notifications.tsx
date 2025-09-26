import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell, CheckCircle, Clock, MessageSquare, DollarSign, AlertTriangle, X } from "lucide-react";

const NotificationCard = ({ 
  id,
  type, 
  title, 
  message, 
  time, 
  read,
  onMarkAsRead,
  onDismiss
}: { 
  id: number;
  type: "mission" | "payment" | "message" | "system";
  title: string; 
  message: string; 
  time: string; 
  read: boolean;
  onMarkAsRead: (id: number) => void;
  onDismiss: (id: number) => void;
}) => {
  const getIcon = () => {
    switch (type) {
      case "mission":
        return <Bell className="w-5 h-5 text-primary" />;
      case "payment":
        return <DollarSign className="w-5 h-5 text-success" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-secondary" />;
      case "system":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={`p-4 transition-smooth cursor-pointer hover:shadow-card ${
      read ? "bg-card" : "bg-card shadow-card border-l-4 border-l-primary"
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`font-medium text-sm ${
              read ? "text-muted-foreground" : "text-foreground"
            }`}>
              {title}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 -mt-1 -mr-2"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(id);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className={`text-sm leading-relaxed mb-2 ${
            read ? "text-muted-foreground" : "text-foreground"
          }`}>
            {message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{time}</p>
            {!read && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary/80 px-2 py-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(id);
                }}
              >
                Segna come letto
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "mission" as const,
      title: "Nuova missione disponibile",
      message: "Una nuova missione di consegna pacchi è disponibile nella tua zona. Compenso: €25",
      time: "5 minuti fa",
      read: false
    },
    {
      id: 2,
      type: "payment" as const,
      title: "Pagamento ricevuto",
      message: "Hai ricevuto €25 per la missione 'Consegna pacchi centro città'. Il denaro è ora disponibile nel tuo wallet.",
      time: "2 ore fa",
      read: false
    },
    {
      id: 3,
      type: "message" as const,
      title: "Nuovo messaggio da Marco",
      message: "Marco ti ha inviato un messaggio riguardo alla missione di domani mattina.",
      time: "3 ore fa",
      read: false
    },
    {
      id: 4,
      type: "system" as const,
      title: "Aggiornamento app",
      message: "È disponibile una nuova versione dell'app con miglioramenti e correzioni di bug.",
      time: "1 giorno fa",
      read: true
    },
    {
      id: 5,
      type: "mission" as const,
      title: "Missione completata",
      message: "La tua missione 'Dog sitting Milo' è stata confermata come completata. Ottimo lavoro!",
      time: "1 giorno fa",
      read: true
    },
    {
      id: 6,
      type: "payment" as const,
      title: "Pagamento in escrow",
      message: "€60 sono stati bloccati in escrow per la missione 'Dog sitting weekend'.",
      time: "2 giorni fa",
      read: true
    },
    {
      id: 7,
      type: "message" as const,
      title: "Messaggio da Sofia",
      message: "Sofia ha confermato la tua partecipazione alla missione di pet sitting.",
      time: "3 giorni fa",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleDismiss = (id: number) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="min-h-screen bg-background pb-6">
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
              <div>
                <h1 className="text-xl font-bold text-foreground">Notifiche</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} non lette
                  </p>
                )}
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-primary hover:text-primary/80"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Segna tutto
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-card shadow-card border-0">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nessuna notifica
            </h3>
            <p className="text-muted-foreground">
              Quando riceverai nuove notifiche, le vedrai qui
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;