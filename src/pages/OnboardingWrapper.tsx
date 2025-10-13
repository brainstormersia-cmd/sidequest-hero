import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FirstTimeOnboarding } from "@/components/FirstTimeOnboarding";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const OnboardingWrapper = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If user is not authenticated, redirect to login
    if (!user) {
      navigate('/login?next=%2Fonboarding');
      return;
    }

    if (profile?.onboarding_completed) {
      navigate('/dashboard');
    } else {
      setShowOnboarding(true);
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!showOnboarding) {
    return null;
  }

  const handleComplete = async () => {
    const { error } = await updateProfile({ onboarding_completed: true });

    if (error) {
      toast({
        title: "Aggiornamento profilo non riuscito",
        description: "Riprova più tardi a completare l'onboarding.",
        variant: "destructive",
      });
      return;
    }

    setShowOnboarding(false);
    navigate('/dashboard');
  };

  return (
    <FirstTimeOnboarding
      onComplete={handleComplete}
    />
  );
};

export default OnboardingWrapper;