import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Shield } from "lucide-react";

interface ReportAbuseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "mission" | "user" | "review";
  targetId: string;
  targetName?: string;
  onSubmit: (data: { reason: string; details: string }) => Promise<void>;
}

const reportReasons = {
  mission: [
    { value: "spam", label: "Spam o contenuto irrilevante" },
    { value: "inappropriate", label: "Contenuto inappropriato o offensivo" },
    { value: "fraud", label: "Truffa o attività fraudolenta" },
    { value: "misleading", label: "Informazioni fuorvianti" },
    { value: "illegal", label: "Attività illegale" },
    { value: "other", label: "Altro" }
  ],
  user: [
    { value: "harassment", label: "Molestie o comportamento inappropriato" },
    { value: "fraud", label: "Truffa o attività fraudolenta" },
    { value: "impersonation", label: "Impersonificazione" },
    { value: "spam", label: "Spam o comportamento fastidioso" },
    { value: "dangerous", label: "Comportamento pericoloso" },
    { value: "other", label: "Altro" }
  ],
  review: [
    { value: "fake", label: "Recensione falsa o spam" },
    { value: "inappropriate", label: "Contenuto inappropriato" },
    { value: "personal", label: "Attacco personale" },
    { value: "irrelevant", label: "Irrilevante alla missione" },
    { value: "other", label: "Altro" }
  ]
};

export const ReportAbuseModal = ({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetName,
  onSubmit
}: ReportAbuseModalProps) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = reportReasons[targetType] || reportReasons.mission;

  const handleSubmit = async () => {
    if (!reason) {
      alert("Seleziona un motivo per la segnalazione");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ reason, details: details.trim() });
      
      // Reset form
      setReason("");
      setDetails("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Errore nell'invio della segnalazione. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case "mission":
        return "questa missione";
      case "user":
        return targetName ? `l'utente ${targetName}` : "questo utente";
      case "review":
        return "questa recensione";
      default:
        return "questo contenuto";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-error-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Segnala un problema</DialogTitle>
              <DialogDescription className="text-sm text-text-muted">
                Stai segnalando {getTargetLabel()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Motivo della segnalazione *
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <div
                    key={r.value}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border-default hover:bg-surface transition-smooth cursor-pointer"
                  >
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label
                      htmlFor={r.value}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {r.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-semibold">
              Dettagli aggiuntivi (opzionale)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Fornisci ulteriori informazioni che possono aiutare la nostra revisione..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <p className="text-xs text-text-muted text-right">
              {details.length}/1000 caratteri
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-info-500/10 border border-info-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-text-primary mb-1">
                  Segnalazione anonima e sicura
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  La tua identità rimarrà riservata. Esamineremo attentamente ogni segnalazione e prenderemo provvedimenti appropriati secondo i nostri{" "}
                  <a href="/terms" className="text-brand-primary hover:underline">
                    termini di servizio
                  </a>
                  . Le segnalazioni false possono comportare provvedimenti sul tuo account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="bg-error-500 text-white hover:bg-error-500/90"
          >
            {isSubmitting ? "Invio in corso..." : "Invia segnalazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
