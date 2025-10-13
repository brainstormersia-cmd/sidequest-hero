import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, Plus, MessageSquare, Wallet, Award, Bell, MapPin, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  badge?: number;
  size?: "default" | "sm";
}

const NavLink = ({ to, icon, label, primary, badge, size = "default" }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/dashboard" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-smooth relative",
        size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant font-semibold"
          : isActive
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className={size === "sm" ? "w-4 h-4" : "w-5 h-5"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <Badge variant="destructive" className="ml-auto text-xs">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

export const DesktopSidebar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-50">
      {/* Header with Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/sidequest-logo.jpg" 
            alt="SideQuest" 
            className="w-10 h-10 rounded-xl object-cover" 
          />
          <div>
            <h2 className="font-bold text-lg text-foreground">SideQuest</h2>
            <p className="text-xs text-muted-foreground">Earn & Help</p>
          </div>
        </div>
        
        {/* User Profile - Clickable */}
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:border-primary/20 transition-smooth"
        >
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-sm truncate text-foreground">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Livello {Math.floor((profile?.missions_completed || 0) / 10) + 1} • ⭐ {profile?.rating_average?.toFixed(1) || '5.0'}
            </p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Primary Actions */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Azioni Principali</p>
        <div className="space-y-1">
          <NavLink to="/dashboard" icon={<Home />} label="Home" />
          <NavLink to="/missions" icon={<Briefcase />} label="Missioni" />
          <NavLink to="/create-mission" icon={<Plus />} label="Crea Missione" primary />
        </div>
      </div>
      
      {/* Secondary Nav */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Altro</p>
        <div className="space-y-1">
          <NavLink to="/chat" icon={<MessageSquare />} label="Chat" size="sm" />
          <NavLink to="/wallet" icon={<Wallet />} label="Portafoglio" size="sm" />
          <NavLink to="/badges" icon={<Award />} label="Badge" size="sm" />
          <NavLink to="/categories" icon={<MapPin />} label="Categorie" size="sm" />
          <NavLink to="/notifications" icon={<Bell />} label="Notifiche" size="sm" />
        </div>
      </nav>
    </div>
  );
};
