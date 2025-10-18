import { Lock, Info, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EscrowWidgetProps {
  amount: number;
  status: "reserved" | "in_progress" | "pending_release" | "released" | "disputed";
  daysUntilAutoRelease?: number;
  className?: string;
  onLearnMore?: () => void;
}

export const EscrowWidget = ({
  amount,
  status,
  daysUntilAutoRelease,
  className,
  onLearnMore
}: EscrowWidgetProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "reserved":
        return {
          label: "Fondi riservati",
          icon: Lock,
          bgColor: "bg-brand-secondary/10",
          borderColor: "border-brand-secondary/20",
          textColor: "text-brand-secondary",
          description: "Il pagamento è stato riservato in sicurezza"
        };
      case "in_progress":
        return {
          label: "Lavoro in corso",
          icon: Clock,
          bgColor: "bg-warning-500/10",
          borderColor: "border-warning-500/20",
          textColor: "text-warning-500",
          description: "Completa la missione per ricevere il pagamento"
        };
      case "pending_release":
        return {
          label: "In attesa di rilascio",
          icon: Clock,
          bgColor: "bg-info-500/10",
          borderColor: "border-info-500/20",
          textColor: "text-info-500",
          description: daysUntilAutoRelease
            ? `Rilascio automatico tra ${daysUntilAutoRelease} giorni`
            : "In attesa di approvazione"
        };
      case "released":
        return {
          label: "Pagamento rilasciato",
          icon: CheckCircle2,
          bgColor: "bg-success-500/10",
          borderColor: "border-success-500/20",
          textColor: "text-success-500",
          description: "Il pagamento è stato trasferito al tuo wallet"
        };
      case "disputed":
        return {
          label: "In disputa",
          icon: Info,
          bgColor: "bg-error-500/10",
          borderColor: "border-error-500/20",
          textColor: "text-error-500",
          description: "È in corso una revisione del pagamento"
        };
      default:
        return {
          label: "Stato sconosciuto",
          icon: Info,
          bgColor: "bg-surface",
          borderColor: "border-border-default",
          textColor: "text-text-muted",
          description: ""
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "p-4 transition-smooth hover:shadow-elegant",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <StatusIcon className={cn("w-5 h-5", config.textColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <Badge variant="outline" className={cn("text-xs mb-2", config.textColor)}>
                {config.label}
              </Badge>
              <p className="text-2xl font-bold text-text-primary">
                €{amount.toFixed(2)}
              </p>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onLearnMore}
                  >
                    <Info className="w-4 h-4 text-text-muted" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Come funziona l'escrow?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {config.description}
          </p>

          {daysUntilAutoRelease && status === "pending_release" && (
            <div className="mt-3 pt-3 border-t border-border-default">
              <p className="text-xs text-text-muted">
                <span className="font-medium text-text-primary">
                  Rilascio automatico
                </span>
                {" "}tra {daysUntilAutoRelease} {daysUntilAutoRelease === 1 ? "giorno" : "giorni"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
