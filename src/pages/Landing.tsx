import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Search, DollarSign, Briefcase, Eye } from "lucide-react";
import sidequestLogo from "@/assets/sidequest-logo.jpg";
import { MultiStepRegistration } from "@/components/MultiStepRegistration";
import { LoginForm } from "@/components/LoginForm";

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <Card className="bg-secondary text-secondary-foreground p-6 rounded-3xl border-0 shadow-floating hover:scale-[1.02] transition-bounce">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-secondary-foreground/80 leading-relaxed">{description}</p>
  </Card>
);

const Landing = () => {
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState<'landing' | 'register' | 'login' | 'explore'>('landing');

  if (activeFlow === 'register') {
    return <MultiStepRegistration onBack={() => setActiveFlow('landing')} />;
  }

  if (activeFlow === 'login') {
    return <LoginForm onBack={() => setActiveFlow('landing')} />;
  }

  if (activeFlow === 'explore') {
    // Navigate to dashboard in read-only mode (guest mode)
    navigate('/dashboard?guest=true');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src={sidequestLogo} 
            alt="SideQuest" 
            className="w-24 h-24 rounded-3xl shadow-floating hover:scale-105 transition-bounce" 
          />
        </div>

        {/* Hero Title */}
        <div className="text-center mb-8 animate-fade-in animation-delay-200">
          <h1 className="text-5xl font-bold text-white mb-4 text-balance">
            Benvenuto in<br />
            <span className="text-primary">SideQuest</span>
          </h1>
          <p className="text-white/90 text-xl text-balance max-w-md mx-auto leading-relaxed">
            La community che connette persone, crea opportunità e trasforma il tempo in valore
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4 mb-12 animate-fade-in animation-delay-400">
          <Button 
            onClick={() => setActiveFlow('register')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-semibold rounded-2xl shadow-floating transition-bounce hover:scale-[1.02] active:scale-95"
          >
            Registrati
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
          
          <Button 
            onClick={() => setActiveFlow('login')}
            variant="outline"
            className="w-full border-2 border-white/20 bg-white/10 text-white hover:bg-white/20 h-14 text-lg font-semibold rounded-2xl backdrop-blur-sm transition-bounce hover:scale-[1.02] active:scale-95"
          >
            Accedi
          </Button>
          
          <Button 
            onClick={() => setActiveFlow('explore')}
            variant="ghost"
            className="w-full text-white/80 hover:text-white hover:bg-white/10 h-12 text-base font-medium rounded-xl transition-smooth"
          >
            <Eye className="w-5 h-5 mr-2" />
            Sto solo dando un'occhiata
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-4 animate-fade-in animation-delay-600">
          <FeatureCard
            icon={<Search className="w-6 h-6 text-primary-foreground" />}
            title="Trova missioni"
            description="Scopri opportunità uniche nella tua città e trasforma il tuo tempo libero in guadagno"
          />
          
          <FeatureCard
            icon={<DollarSign className="w-6 h-6 text-primary-foreground" />}
            title="Guadagna in sicurezza"
            description="Sistema escrow sicuro, pagamenti garantiti e rating verificati per ogni transazione"
          />
          
          <FeatureCard
            icon={<Briefcase className="w-6 h-6 text-primary-foreground" />}
            title="Crea e gestisci"
            description="Pubblica le tue richieste, trova aiuto qualificato e costruisci la tua reputazione"
          />
        </div>

        {/* Community Stats */}
        <div className="w-full max-w-md mt-8 animate-fade-in animation-delay-800">
          <Card className="bg-white/10 backdrop-blur-sm border-0 p-6 rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">2.8K+</div>
                <div className="text-white/80 text-sm">Sidequester</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">15K+</div>
                <div className="text-white/80 text-sm">Missioni</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-white/80 text-sm">Rating</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;