import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import sidequestLogo from "@/assets/sidequest-logo.jpg";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onBack: () => void;
  nextPath?: string | null;
}

export function LoginForm({ onBack, nextPath }: LoginFormProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Campi richiesti",
        description: "Inserisci email e password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      toast({
        title: "Errore di login",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      toast({
        title: "Benvenuto!",
        description: "Login effettuato con successo",
      });

      if (nextPath) {
        navigate(nextPath, { replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;

      if (!userId) {
        navigate('/dashboard');
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile after login', profileError);
        navigate('/dashboard');
        return;
      }

      if (profileRow?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
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
          
          <div className="text-center text-foreground">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Bentornato!</h1>
            <p className="text-muted-foreground">Accedi al tuo account SideQuest</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-sm md:max-w-md p-4 sm:p-6 bg-card backdrop-blur-sm border-2 border-primary/20 shadow-floating">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 h-11 md:h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="nome@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 h-11 md:h-12 border-0 bg-muted/50 focus:bg-card transition-smooth"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Ricordami
                </Label>
              </div>
              
              <Button
                variant="link"
                className="text-sm text-primary hover:text-primary/80 p-0 h-auto font-medium"
                type="button"
              >
                Password dimenticata?
              </Button>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-12 text-base font-semibold rounded-xl shadow-card transition-bounce hover:scale-[1.02] active:scale-95 touch-manipulation"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Oppure continua con
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-muted hover:bg-muted/50 transition-smooth"
                type="button"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              
              <Button
                variant="outline"
                className="h-12 border-muted hover:bg-muted/50 transition-smooth"
                type="button"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </Card>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Non hai ancora un account?{" "}
            <button
              onClick={() => onBack()}
              className="text-primary font-medium hover:text-primary/80 transition-smooth touch-manipulation"
            >
              Registrati qui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}