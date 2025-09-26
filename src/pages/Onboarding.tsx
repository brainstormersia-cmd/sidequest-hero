import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Search, DollarSign, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sidequestLogo from "@/assets/sidequest-logo.jpg";

const OnboardingStep = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <Card className="bg-secondary text-secondary-foreground p-6 rounded-3xl border-0 shadow-card">
    <div className="flex items-center gap-4 mb-3">
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-secondary-foreground/80 leading-relaxed">{description}</p>
  </Card>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate auth - in production, integrate with your auth provider
    toast({
      title: "Benvenuto in SideQuest!",
      description: "Login effettuato con successo",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={sidequestLogo} 
            alt="SideQuest" 
            className="w-20 h-20 rounded-2xl shadow-floating" 
          />
        </div>

        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-foreground mb-4 text-balance">
            Benvenuto in SideQuest
          </h1>
          <p className="text-secondary-foreground/80 text-lg text-balance max-w-sm">
            Trova missioni, guadagna con il tuo tempo, crea opportunità
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-4 mb-8">
          <OnboardingStep
            icon={<Search className="w-6 h-6" />}
            title="Trova missioni"
            description="Scopri lavoretti e missioni nella tua zona"
          />
          
          <OnboardingStep
            icon={<DollarSign className="w-6 h-6" />}
            title="Guadagna con il tuo tempo"
            description="Trasforma il tempo libero in guadagno extra"
          />
          
          <OnboardingStep
            icon={<Briefcase className="w-6 h-6" />}
            title="Crea e gestisci lavoretti"
            description="Pubblica le tue richieste e trova aiuto"
          />
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md p-6 bg-card/95 backdrop-blur-sm border-0 shadow-floating">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-0 bg-muted/50 focus:bg-card transition-smooth"
                placeholder="inserisci@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-0 bg-muted/50 focus:bg-card transition-smooth"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold rounded-xl shadow-card transition-bounce hover:scale-[1.02]"
            >
              {isLogin ? "Accedi" : "Inizia Subito"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              {isLogin ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;