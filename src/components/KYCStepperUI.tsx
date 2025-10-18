import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Upload, Clock, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "pending" | "error";

interface KYCStep {
  id: number;
  label: string;
  status: StepStatus;
}

interface KYCStepperUIProps {
  currentStep?: number;
  steps?: KYCStep[];
  verificationStatus?: "pending" | "in_progress" | "approved" | "rejected";
  onUpload?: (file: File) => void;
  className?: string;
}

const defaultSteps: KYCStep[] = [
  { id: 1, label: "Dati personali", status: "completed" },
  { id: 2, label: "Verifica identità", status: "current" },
  { id: 3, label: "Documento", status: "pending" },
];

export const KYCStepperUI: React.FC<KYCStepperUIProps> = ({
  currentStep = 2,
  steps = defaultSteps,
  verificationStatus = "pending",
  onUpload,
  className,
}) => {
  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In attesa
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Verifica in corso (24-48h)
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            Verificato
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Verifica fallita
          </Badge>
        );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header with status */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">
            Verifica KYC/KYB
          </h2>
          {getStatusBadge()}
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors duration-fast",
                    step.status === "completed" &&
                      "bg-success-500 text-text-inverted",
                    step.status === "current" &&
                      "bg-primary-600 text-text-inverted ring-4 ring-primary-600/20",
                    step.status === "pending" &&
                      "bg-surface border-2 border-border-default text-text-muted",
                    step.status === "error" &&
                      "bg-destructive text-destructive-foreground"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px]",
                    step.status === "current"
                      ? "text-text-primary"
                      : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded transition-colors duration-fast",
                    step.status === "completed"
                      ? "bg-success-500"
                      : "bg-border-default"
                  )}
                  style={{ marginTop: "-2rem" }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Upload Area */}
        {currentStep === 2 && verificationStatus !== "approved" && (
          <div className="space-y-4">
            <label
              htmlFor="document-upload"
              className="block border-2 border-dashed border-border-interactive rounded-lg p-8 text-center cursor-pointer hover:bg-state-hover transition-colors duration-fast"
            >
              <input
                id="document-upload"
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <FileText className="w-12 h-12 mx-auto mb-4 text-text-muted" />
              <p className="text-text-primary font-medium mb-1">
                Carica documento di identità
              </p>
              <p className="text-sm text-text-muted">
                Formati accettati: PDF, JPG, PNG (max 5MB)
              </p>
            </label>

            <div className="flex items-start gap-2 p-3 bg-info-500/10 rounded-md border border-info-500/20">
              <AlertCircle className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-primary mb-1">
                  Documenti accettati:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Carta d'identità (fronte e retro)</li>
                  <li>Patente di guida</li>
                  <li>Passaporto</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {verificationStatus === "rejected" && (
          <Button variant="primary" size="default" className="w-full">
            Riprova verifica
          </Button>
        )}
      </div>
    </Card>
  );
};
