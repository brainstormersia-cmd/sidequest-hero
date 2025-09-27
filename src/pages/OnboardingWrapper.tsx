import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FirstTimeOnboarding } from "@/components/FirstTimeOnboarding";
import { Skeleton } from "@/components/ui/skeleton";

const OnboardingWrapper = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If user is not authenticated, redirect to landing
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('sidequest_onboarding_completed');
    
    if (hasCompletedOnboarding) {
      navigate('/dashboard');
    } else {
      setShowOnboarding(true);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
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

  return (
    <FirstTimeOnboarding 
      onComplete={() => setShowOnboarding(false)} 
    />
  );
};

export default OnboardingWrapper;