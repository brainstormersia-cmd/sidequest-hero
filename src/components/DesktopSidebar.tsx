import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Briefcase, Plus, MessageSquare, Wallet, Award, Bell, MapPin, Settings, Menu, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string | React.ReactNode;
  primary?: boolean;
  badge?: number;
  size?: "default" | "sm";
  collapsed?: boolean;
}

const NavLink = ({ to, icon, label, primary, badge, size = "default", collapsed = false }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/dashboard" && location.pathname.startsWith(to));

  const labelText = typeof label === 'string' ? label : '';
  
  return (
    <Link
      to={to}
      title={collapsed ? labelText : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-smooth relative",
        size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3",
        collapsed && "justify-center",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant font-semibold"
          : isActive
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className={size === "sm" ? "w-4 h-4" : "w-5 h-5"}>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && badge > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
};

export const DesktopSidebar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isOpen, toggle } = useSidebar();

  return (
    <div className={cn(
      "hidden lg:flex fixed left-0 top-0 h-screen bg-card border-r border-border flex-col z-50 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {isOpen && (
          <div className="flex items-center gap-3">
            <img 
              src="/sidequest-logo.jpg" 
              alt="SideQuest" 
              className="w-8 h-8 rounded-xl object-cover" 
            />
            <div>
              <h2 className="font-bold text-sm text-foreground">SideQuest</h2>
              <p className="text-xs text-muted-foreground">Earn & Help</p>
            </div>
          </div>
        )}
      </div>
        
      {/* User Profile - Clickable */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate("/profile")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:border-primary/20 transition-smooth",
            !isOpen && "justify-center"
          )}
        >
          <Avatar className={cn("ring-2 ring-primary/20", isOpen ? "w-12 h-12" : "w-8 h-8")}>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm truncate text-foreground">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Livello {Math.floor((profile?.missions_completed || 0) / 10) + 1} • ⭐ {profile?.rating_average?.toFixed(1) || '5.0'}
                </p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </>
          )}
        </button>
      </div>
      
      {/* Primary Actions */}
      <div className="px-4 pt-4 pb-2">
        {isOpen && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Azioni Principali</p>
        )}
        <div className="space-y-1">
          <NavLink to="/dashboard" icon={<Home />} label="Home" collapsed={!isOpen} />
          <NavLink to="/missions" icon={<Briefcase />} label="Missioni" collapsed={!isOpen} />
          <NavLink to="/create-mission" icon={<Plus />} label="Crea Missione" primary collapsed={!isOpen} />
        </div>
      </div>
      
      {/* Secondary Nav */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {isOpen && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Altro</p>
        )}
        <div className="space-y-1">
          <NavLink to="/chat" icon={<MessageSquare />} label="Chat" size="sm" collapsed={!isOpen} />
          <NavLink to="/wallet" icon={<Wallet />} label="Portafoglio" size="sm" collapsed={!isOpen} />
          <NavLink to="/badges" icon={<Award />} label="Badge" size="sm" collapsed={!isOpen} />
          <NavLink 
            to="/shop" 
            icon={<ShoppingBag />} 
            label={
              !isOpen ? "Shop" : (
                <span className="flex items-center gap-2">
                  Shop
                  <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
                    -20% OGGI
                  </span>
                </span>
              )
            }
            size="sm" 
            collapsed={!isOpen} 
          />
          <NavLink to="/categories" icon={<MapPin />} label="Categorie" size="sm" collapsed={!isOpen} />
          <NavLink to="/notifications" icon={<Bell />} label="Notifiche" size="sm" collapsed={!isOpen} />
        </div>
      </nav>
    </div>
  );
};
