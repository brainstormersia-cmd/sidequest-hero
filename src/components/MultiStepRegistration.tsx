import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import sidequestLogo from "@/assets/sidequest-logo.jpg";

interface MultiStepRegistrationProps {
  onBack: () => void;
}

const steps = [
  { title: "Nome e Cognome", description: "Come ti chiami?" },
  { title: "Email", description: "Il tuo indirizzo email" },
  { title: "Data di nascita", description: "Per verificare la tua età" },
  { title: "Password", description: "Crea una password sicura" },
  { title: "Verifica", description: "Conferma il tuo account" }
];

export function MultiStepRegistration({ onBack }: MultiStepRegistrationProps) {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: ""
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Final step - submit registration
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Errore",
          description: "Le password non coincidono",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (error) {
        toast({
          title: "Errore nella registrazione",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registrazione completata!",
          description: "Controlla la tua email per confermare l'account",
        });
        navigate("/onboarding");
      }
      setLoading(false);
    } else {
      // Validation for each step
      if (currentStep === 0 && (!formData.firstName || !formData.lastName)) {
        toast({
          title: "Campi richiesti",
          description: "Inserisci nome e cognome",
          variant: "destructive",
        });
        return;
      }
      if (currentStep === 1 && !formData.email) {
        toast({
          title: "Email richiesta",
          description: "Inserisci un indirizzo email valido",
          variant: "destructive",
        });
        return;
      }
      if (currentStep === 2 && !formData.dateOfBirth) {
        toast({
          title: "Data richiesta",
          description: "Inserisci la tua data di nascita",
          variant: "destructive",
        });
        return;
      }
      if (currentStep === 3 && formData.password.length < 6) {
        toast({
          title: "Password troppo corta",
          description: "La password deve essere di almeno 6 caratteri",
          variant: "destructive",
        });
        return;
      }
      
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.firstName && formData.lastName;
      case 1: return formData.email;
      case 2: return formData.dateOfBirth;
      case 3: return formData.password.length >= 6;
      case 4: return formData.confirmPassword;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Floating shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 md:w-32 md:h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 md:w-40 md:h-40 bg-primary/5 rounded-full blur-3xl animate-float animation-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-22 h-22 md:w-36 md:h-36 bg-primary/10 rounded-full blur-3xl animate-float animation-delay-400"></div>
        <div className="absolute bottom-20 right-1/3 w-18 h-18 md:w-28 md:h-28 bg-primary/5 rounded-full blur-3xl animate-float animation-delay-600"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        {/* Header */}
        <div className="w-full max-w-sm md:max-w-md mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-foreground hover:bg-muted rounded-full min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
            <img 
              src={sidequestLogo} 
              alt="SideQuest" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl" 
            />
            <div className="w-10 md:w-10" /> {/* Spacer */}
          </div>
          
          <Progress value={progress} className="mb-4 bg-muted" />
          
          <div className="text-center text-foreground">
            <h1 className="text-xl md:text-2xl font-bold mb-1">{steps[currentStep].title}</h1>
            <p className="text-muted-foreground text-sm">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="w-full max-w-sm md:max-w-md p-4 sm:p-6 bg-card backdrop-blur-sm border-2 border-primary/20 shadow-floating">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 h-11 md:h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="Il tuo nome"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Cognome
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 h-11 md:h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="Il tuo cognome"
                />
              </div>

              <div className="pt-4">
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 h-12 border-2 border-dashed border-muted-foreground/30 rounded-xl"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Aggiungi foto profilo (opzionale)
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="nome@email.com"
                />
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Useremo la tua email per inviarti aggiornamenti importanti sulle tue missioni e per la sicurezza del tuo account.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Data di nascita
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="mt-1 h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                />
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Devi avere almeno 16 anni per utilizzare SideQuest. La tua data di nascita non sarà visibile pubblicamente.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? 'bg-success' : 'bg-muted'}`} />
                  <span className={formData.password.length >= 6 ? 'text-success' : 'text-muted-foreground'}>
                    Almeno 6 caratteri
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-success' : 'bg-muted'}`} />
                  <span className={/[A-Z]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}>
                    Una lettera maiuscola
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-success' : 'bg-muted'}`} />
                  <span className={/[0-9]/.test(formData.password) ? 'text-success' : 'text-muted-foreground'}>
                    Un numero
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Conferma password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="••••••••"
                />
              </div>
              
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${formData.password === formData.confirmPassword ? 'bg-success' : 'bg-destructive'}`} />
                  <span className={formData.password === formData.confirmPassword ? 'text-success' : 'text-destructive'}>
                    {formData.password === formData.confirmPassword ? 'Le password coincidono' : 'Le password non coincidono'}
                  </span>
                </div>
              )}
              
              <div className="bg-primary/10 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-foreground">Quasi fatto!</h4>
                    <p className="text-sm text-muted-foreground">
                      Cliccando "Crea Account" accetti i nostri termini di servizio e la privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-12 text-base font-semibold rounded-xl shadow-card transition-bounce hover:scale-[1.02] active:scale-95 mt-6 touch-manipulation"
          >
            {currentStep === steps.length - 1 ? (
              loading ? "Creazione account..." : "Crea Account"
            ) : (
              "Continua"
            )}
            {currentStep < steps.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </Card>
      </div>
    </div>
  );
}