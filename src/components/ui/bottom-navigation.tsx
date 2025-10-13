import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Wallet, User } from "lucide-react";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      icon: Briefcase,
      label: "Home",
      path: "/dashboard"
    },
    {
      icon: MapPin,
      label: "Missioni",
      path: "/missions"
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "/wallet"
    },
    {
      icon: User,
      label: "Profilo",
      path: "/profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 px-6 py-3 z-40 lg:hidden">
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const IconComponent = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className="flex-col gap-1 h-auto py-2"
              onClick={() => navigate(item.path)}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;