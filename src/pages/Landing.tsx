import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Search, DollarSign, Briefcase, Eye, ShoppingBag } from "lucide-react";
import sidequestLogo from "@/assets/sidequest-logo.jpg";
import { MultiStepRegistration } from "@/components/MultiStepRegistration";
import { useAuth } from "@/contexts/AuthContext";
import { products } from "@/data/products";

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <Card className="bg-card border-4 border-primary/20 hover:border-primary p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(255,214,10,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(255,214,10,0.3)] hover:-translate-y-1 hover:rotate-1 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-black text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-snug">{description}</p>
      </div>
    </div>
  </Card>
);

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const [activeFlow, setActiveFlow] = useState<'landing' | 'register' | 'explore'>('landing');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (loading || !user || activeFlow !== 'landing') return;
    
    const onboardingCompleted = localStorage.getItem('sidequest_onboarding_completed') === 'true';
    if (onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  }, [user, loading, activeFlow, navigate]);

  if (activeFlow === 'register') {
    return <MultiStepRegistration onBack={() => setActiveFlow('landing')} />;
  }

  if (activeFlow === 'explore') {
    // Navigate to dashboard in read-only mode (guest mode)
    navigate('/dashboard?guest=true');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Floating shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float animation-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-primary/10 rounded-full blur-3xl animate-float animation-delay-400"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-primary/5 rounded-full blur-3xl animate-float animation-delay-600"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Logo */}
        <div className="mb-4 md:mb-6 animate-fade-in">
          <img 
            src={sidequestLogo} 
            alt="SideQuest" 
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl shadow-floating hover:scale-105 transition-bounce border-4 border-primary/20" 
          />
        </div>

        {/* Hero Title */}
        <div className="text-center mb-4 md:mb-6 animate-fade-in animation-delay-200">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2 md:mb-3 text-balance">
            Benvenuto in
          </h1>
          <h1 className="text-4xl md:text-6xl font-black text-primary mb-3 md:mb-4 text-balance tracking-tight">
            SideQuest
          </h1>
          <p className="text-foreground/80 text-base md:text-lg text-balance max-w-md mx-auto leading-relaxed font-medium px-4">
            Fai quello che ti piace. Guadagna. Aiuta la tua città. 🚀
          </p>
        </div>

        {/* Live Community Stats Ticker */}
        <div className="mb-8 animate-fade-in animation-delay-400">
          <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 p-4 rounded-2xl shadow-floating">
            <div className="flex items-center gap-3 text-center">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <div>
                <p className="text-3xl font-black text-primary">€12.5K</p>
                <p className="text-xs text-muted-foreground font-medium">guadagnati oggi dalla community</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3 mb-8 md:mb-10 animate-fade-in animation-delay-600 px-4">
          <Button 
            onClick={() => setActiveFlow('register')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 md:h-16 text-lg md:text-xl font-black rounded-2xl md:rounded-3xl shadow-[8px_8px_0px_0px_rgba(255,214,10,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(255,214,10,0.4)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(255,214,10,0.3)] touch-manipulation"
          >
            🚀 Inizia la tua avventura
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2" />
          </Button>
          
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full border-3 md:border-4 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background h-12 md:h-14 text-base md:text-lg font-bold rounded-xl md:rounded-2xl transition-all hover:scale-[1.02] active:scale-95 touch-manipulation"
          >
            Bentornato, Sidequester! 👋
          </Button>
          
          <Button 
            onClick={() => setActiveFlow('explore')}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 h-11 md:h-12 text-sm md:text-base font-medium rounded-xl transition-smooth touch-manipulation"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Prima dai un'occhiata 👀
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-3 animate-fade-in animation-delay-800 px-4">
          <FeatureCard
            icon={<Search className="w-8 h-8 text-primary" />}
            title="🎯 Trova quest"
            description="€15-50/ora in media · Opportunità vicino a te"
          />
          
          <FeatureCard
            icon={<DollarSign className="w-8 h-8 text-success" />}
            title="💰 Guadagna subito"
            description="Pagamenti sicuri · Saldo disponibile in 24h"
          />
          
          <FeatureCard
            icon={<Briefcase className="w-8 h-8 text-secondary" />}
            title="🚀 Costruisci la tua rep"
            description="Rating verificati · Community di fiducia"
          />
        </div>

        {/* Shop Hero Section */}
        <div className="w-full max-w-4xl mt-12 mb-8 animate-fade-in animation-delay-900 px-4">
          <Card className="bg-card border-2 border-primary/30 p-6 md:p-8 rounded-3xl shadow-elegant">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                ✨ Potenzia la tua esperienza
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Boost, pack esclusivi e abbonamenti per portare il tuo gioco al livello successivo
              </p>
            </div>

            {/* Featured Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[products[0], products[2], products[5]].map((product) => (
                <Card 
                  key={product.id} 
                  className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 p-4 hover:border-primary/40 transition-all cursor-pointer hover:scale-105"
                  onClick={() => navigate('/shop')}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-3 overflow-hidden">
                    <img 
                      src={product.coverUrl} 
                      alt={product.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  {product.badge && (
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                        {product.badge}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-sm text-foreground mb-1">{product.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>
                  <p className="text-lg font-black text-primary">{product.price}</p>
                </Card>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button 
                onClick={() => navigate('/shop')}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Vai allo Shop
              </Button>
            </div>
          </Card>
        </div>

        {/* Community Stats */}
        <div className="w-full max-w-md mt-8 animate-fade-in animation-delay-1000">
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 p-6 rounded-3xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-foreground mb-1">👥</div>
                <div className="text-2xl font-bold text-primary">2.8K+</div>
                <div className="text-muted-foreground text-xs font-medium">Sidequester attivi</div>
              </div>
              <div>
                <div className="text-3xl font-black text-foreground mb-1">⚡</div>
                <div className="text-2xl font-bold text-success">15K+</div>
                <div className="text-muted-foreground text-xs font-medium">Quest completate</div>
              </div>
              <div>
                <div className="text-3xl font-black text-foreground mb-1">⭐</div>
                <div className="text-2xl font-bold text-warning">4.9/5</div>
                <div className="text-muted-foreground text-xs font-medium">Rating medio</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;