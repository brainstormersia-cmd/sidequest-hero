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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Requirement {
  id: string;
  text: string;
  met: boolean;
}

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionTitle: string;
  missionPrice: number;
  missionLocation: string;
  missionDuration?: string;
  requirements?: Requirement[];
  questions?: string[];
  onSubmit: (data: { message: string; answers?: string[] }) => Promise<void>;
  isSubmitting?: boolean;
}

export const ApplicationModal = ({
  open,
  onOpenChange,
  missionTitle,
  missionPrice,
  missionLocation,
  missionDuration,
  requirements = [],
  questions = [],
  onSubmit,
  isSubmitting = false
}: ApplicationModalProps) => {
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [acceptTerms, setAcceptTerms] = useState(false);

  const allRequirementsMet = requirements.every(req => req.met);
  const canSubmit = acceptTerms && allRequirementsMet && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    await onSubmit({
      message: message.trim(),
      answers: questions.length > 0 ? answers : undefined
    });
    
    // Reset form
    setMessage("");
    setAnswers(new Array(questions.length).fill(""));
    setAcceptTerms(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Candidati per questa missione</DialogTitle>
          <DialogDescription className="text-sm text-text-muted">
            Rivedi i dettagli e invia la tua candidatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mission Summary */}
          <div className="bg-surface rounded-lg p-4 border border-border-default">
            <h3 className="font-semibold text-text-primary mb-3">{missionTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="w-4 h-4" />
                <span>{missionLocation}</span>
              </div>
              {missionDuration && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span>{missionDuration}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border-default">
                <span className="text-lg font-bold text-brand-primary">
                  €{missionPrice.toFixed(2)}
                </span>
                <span className="text-xs text-text-muted ml-2">compenso totale</span>
              </div>
            </div>
          </div>

          {/* Requirements Check */}
          {requirements.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Requisiti</Label>
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg border transition-smooth",
                      req.met
                        ? "bg-success-500/5 border-success-500/20"
                        : "bg-error-500/5 border-error-500/20"
                    )}
                  >
                    {req.met ? (
                      <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-text-primary flex-1">{req.text}</p>
                    <Badge
                      variant={req.met ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {req.met ? "OK" : "Mancante"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screening Questions */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Domande dello Giver</Label>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`question-${index}`} className="text-sm">
                      {index + 1}. {question}
                    </Label>
                    <Textarea
                      id={`question-${index}`}
                      value={answers[index]}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[index] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder="Scrivi la tua risposta..."
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Messaggio allo Giver (opzionale)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Presenta brevemente la tua esperienza e motivazione..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-text-muted text-right">
              {message.length}/500 caratteri
            </p>
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3 p-4 bg-surface rounded-lg border border-border-default">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-text-muted leading-relaxed cursor-pointer"
            >
              Confermo di essere disponibile per questa missione e accetto i{" "}
              <a href="/terms" className="text-brand-primary hover:underline">
                termini di servizio
              </a>
              {" "}e la{" "}
              <a href="/privacy" className="text-brand-primary hover:underline">
                privacy policy
              </a>
              .
            </Label>
          </div>

          {!allRequirementsMet && (
            <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Requisiti non soddisfatti
                  </p>
                  <p className="text-xs text-text-muted">
                    Completa il tuo profilo o ottieni le certificazioni richieste prima di candidarti.
                  </p>
                </div>
              </div>
            </div>
          )}
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
            disabled={!canSubmit}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            {isSubmitting ? "Invio in corso..." : "Invia candidatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
