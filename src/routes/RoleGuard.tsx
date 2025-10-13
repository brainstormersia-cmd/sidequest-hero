import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type Role = "worker" | "employer" | "admin";

interface RoleGuardProps {
  allowed: Role[];
  children: ReactNode;
}

const deriveRole = (profileRole?: string | null): Role => {
  if (profileRole === "employer" || profileRole === "admin") {
    return profileRole;
  }
  return "worker";
};

export const RoleGuard = ({ allowed, children }: RoleGuardProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  const role = deriveRole(profile?.account_type ?? (profile as { role?: string } | null)?.role ?? null);

  if (!allowed.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
