import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Plus, MessageSquare, Wallet, User, Award, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  badge?: number;
}

const NavLink = ({ to, icon, label, primary, badge }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== "/dashboard" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth relative",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant"
          : isActive
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <Badge variant="destructive" className="ml-auto">
          {badge}
        </Badge>
      )}
    </Link>
  );
};

export const DesktopSidebar = () => {
  const { profile } = useAuth();

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src="/sidequest-logo.jpg" 
            alt="SideQuest" 
            className="w-12 h-12 rounded-xl object-cover" 
          />
          <div>
            <h2 className="font-bold text-xl text-foreground">SideQuest</h2>
            <p className="text-xs text-muted-foreground">Earn & Help</p>
          </div>
        </div>
      </div>
      
      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink to="/dashboard" icon={<Home />} label="Home" />
        <NavLink to="/missions" icon={<Briefcase />} label="Missioni" />
        <NavLink to="/create-mission" icon={<Plus />} label="Crea Missione" primary />
        <NavLink to="/chat" icon={<MessageSquare />} label="Chat" />
        <NavLink to="/wallet" icon={<Wallet />} label="Portafoglio" />
        <NavLink to="/profile" icon={<User />} label="Profilo" />
        <NavLink to="/badges" icon={<Award />} label="Badge" />
        <NavLink to="/notifications" icon={<Bell />} label="Notifiche" />
      </nav>
      
      {/* User Widget */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Livello {Math.floor((profile?.missions_completed || 0) / 10) + 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
