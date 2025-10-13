import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Users, Shield, Star, Zap } from "lucide-react";
import sidequestLogo from "@/assets/sidequest-logo.jpg";

const onboardingSteps = [
  {
    icon: <Users className="w-12 h-12 text-primary" />,
    title: "Benvenuto nella Community SideQuest",
    description: "Unisciti a migliaia di persone che hanno già trasformato il loro tempo libero in opportunità concrete. Qui ogni missione è un'occasione per crescere, guadagnare e aiutare gli altri.",
    visual: "👋"
  },
  {
    icon: <Zap className="w-12 h-12 text-primary" />,
    title: "Crea Missioni in 2 Minuti",
    description: "Hai bisogno di aiuto? Pubblica la tua richiesta in pochi tap. Dalla spesa settimanale al trasloco, dalla dog-sitting alle consegne urgenti. Il nostro algoritmo trova la persona giusta per te.",
    visual: "⚡"
  },
  {
    icon: <Star className="w-12 h-12 text-primary" />,
    title: "Accetta e Guadagna Subito",
    description: "Scegli le missioni che ti interessano, nella tua zona e nei tuoi orari. Guadagni vanno da €5 per piccoli servizi fino a €200+ per lavoretti più impegnativi. Tu decidi quanto e quando.",
    visual: "💰"
  },
  {
    icon: <Shield className="w-12 h-12 text-primary" />,
    title: "Escrow Sicuro e Rating Affidabili",
    description: "Il pagamento è sempre garantito dal nostro sistema escrow. Nessun rischio, nessuna sorpresa. Il sistema di rating a doppia via costruisce fiducia e reputazione nella community.",
    visual: "🛡️"
  }
];

interface FirstTimeOnboardingProps {
  onComplete: () => void;
}

export function FirstTimeOnboarding({ onComplete }: FirstTimeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === onboardingSteps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white hover:bg-white/10 rounded-full disabled:opacity-50"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <img 
              src={sidequestLogo} 
              alt="SideQuest" 
              className="w-12 h-12 rounded-xl" 
            />
            
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-white/80 hover:bg-white/10 hover:text-white rounded-full text-sm px-4"
            >
              Salta
            </Button>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary w-6'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-md space-y-8">
          {/* Visual Icon */}
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">{step.visual}</div>
            <div className="flex justify-center mb-4">
              {step.icon}
            </div>
          </div>

          {/* Content Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-floating p-8 rounded-3xl text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              {step.description}
            </p>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center">
            <Button 
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg font-semibold rounded-2xl shadow-floating transition-bounce hover:scale-[1.02] active:scale-95"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                "Inizia la tua prima missione"
              ) : (
                <>
                  Continua
                  <ArrowRight className="w-6 h-6 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Community Stats */}
          {currentStep === 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-6 rounded-2xl animate-fade-in">
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
                  <div className="text-2xl font-bold text-white">€847K</div>
                  <div className="text-white/80 text-sm">Guadagnati</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}