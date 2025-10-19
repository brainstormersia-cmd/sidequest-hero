import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, MapPin, Wallet, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

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
      icon: ShoppingBag,
      label: "Shop",
      path: "/shop"
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
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-canvas/95 backdrop-blur-xl border-t border-border-default z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-1 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors active:scale-95"
            >
              <IconComponent className={cn(
                "w-6 h-6 transition-colors",
                isActive ? "text-brand-primary" : "text-text-muted"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-brand-primary" : "text-text-muted"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;