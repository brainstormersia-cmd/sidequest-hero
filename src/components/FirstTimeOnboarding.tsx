import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { HeartHandshake, Sparkles, type LucideIcon } from "lucide-react";
import sidequestLogo from "@/assets/sidequest-logo.jpg";

type AccountType = "worker" | "employer";

type RoleOption = {
  id: "giver" | "doer";
  accountType: AccountType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  ctaLabel: string;
  icon: LucideIcon;
};

const roleOptions: RoleOption[] = [
  {
    id: "giver",
    accountType: "employer",
    title: "Giver",
    subtitle: "Ho bisogno di una mano",
    description: "Pubblica una missione. Paga in escrow. Zero pensieri.",
    badge: "Trend",
    ctaLabel: "Giver",
    icon: HeartHandshake,
  },
  {
    id: "doer",
    accountType: "worker",
    title: "Doer",
    subtitle: "Voglio dare una mano (e guadagnare)",
    description: "Trova missioni vicino a te e incassa in sicurezza.",
    badge: "Più scelto",
    ctaLabel: "Doer",
    icon: Sparkles,
  },
];

interface RoleCardProps {
  option: RoleOption;
  isSelected: boolean;
  onSelect: (option: RoleOption) => void;
}

const RoleCard = ({ option, isSelected, onSelect }: RoleCardProps) => {
  const Icon = option.icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Seleziona il ruolo ${option.title}`}
      onClick={() => onSelect(option)}
      className={cn(
        "group relative w-full rounded-[16px] border border-transparent bg-white p-6 text-left text-[#0B0C0E] transition-colors duration-[120ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F8BFF]",
        "motion-safe:transform motion-safe:transition-transform motion-safe:duration-[120ms] motion-safe:ease-out",
        "motion-reduce:transform-none motion-reduce:transition-none",
        isSelected
          ? "border-[#4F8BFF] shadow-[0_20px_48px_rgba(16,29,72,0.18)] motion-safe:scale-[1.02]"
          : "border-[#E3E5EA] hover:border-[#4F8BFF]/60 hover:shadow-[0_20px_40px_rgba(16,29,72,0.12)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F5FF] text-[#4F8BFF]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-[#6F7280]">
              {option.subtitle}
            </p>
            <p className="text-2xl font-semibold text-[#0B0C0E]">{option.title}</p>
          </div>
        </div>
        <Badge className="border border-[#4F8BFF]/30 bg-[#EBF1FF] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#1F3C80]">
          {option.badge}
        </Badge>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-[#4B4F59]">{option.description}</p>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[16px] border border-[#4F8BFF]",
          isSelected ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
    </button>
  );
};

interface FirstTimeOnboardingProps {
  onComplete: () => void;
}

export function FirstTimeOnboarding({ onComplete }: FirstTimeOnboardingProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultOption = useMemo(() => {
    if (!profile?.account_type) return null;
    return roleOptions.find(option => option.accountType === profile.account_type) ?? null;
  }, [profile?.account_type]);

  useEffect(() => {
    if (defaultOption) {
      setSelectedRole(defaultOption);
    }
  }, [defaultOption]);

  const handleContinue = async () => {
    if (!selectedRole || isSaving) return;

    setIsSaving(true);

    const { error } = await updateProfile({
      account_type: selectedRole.accountType,
      onboarding_completed: true,
    });

    if (error) {
      toast({
        title: "Errore",
        description: "Non siamo riusciti a salvare la tua scelta. Riprova.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Perfetto!",
      description: `Iniziamo come ${selectedRole.title.toLowerCase()}.`,
    });

    setIsSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0B0C0E]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-6 pb-10 pt-12">
        <header className="flex justify-center">
          <img
            src={sidequestLogo}
            alt="SideQuest"
            className="h-12 w-12 rounded-2xl shadow-[0_16px_40px_rgba(31,36,48,0.18)]"
          />
        </header>

        <main className="mt-10 flex flex-1 flex-col">
          <div>
            <h1 id="role-selection-heading" className="text-[24px] font-semibold leading-tight text-[#0B0C0E]">
              Cosa vuoi fare ora?
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#4B4F59]">
              Scegli il tuo ruolo. Potrai cambiarlo quando vuoi.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-labelledby="role-selection-heading"
            className="mt-8 space-y-4"
          >
            {roleOptions.map(option => (
              <RoleCard
                key={option.id}
                option={option}
                isSelected={selectedRole?.id === option.id}
                onSelect={setSelectedRole}
              />
            ))}
          </div>
        </main>

        <footer className="mt-8">
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || isSaving}
            className="flex h-14 w-full items-center justify-center rounded-[16px] bg-[#4F8BFF] text-base font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#3E6FDB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F8BFF] disabled:cursor-not-allowed disabled:bg-[#D7DAE0] disabled:text-[#7A7F8B] motion-reduce:transition-none"
          >
            <span aria-live="polite">
              {selectedRole ? `Inizia come ${selectedRole.ctaLabel}` : "Scegli e continua"}
            </span>
          </Button>
          <p className="mt-3 text-center text-sm leading-relaxed text-[#6F7280]">
            Potrai modificarlo in qualsiasi momento dalle impostazioni del profilo.
          </p>
        </footer>
      </div>
    </div>
  );
}

