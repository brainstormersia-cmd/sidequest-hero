import { cn } from "@/lib/utils";

interface MilestoneProgressProps {
  current: number;
  next: number;
  label: string;
  showPercentage?: boolean;
  className?: string;
}

export const MilestoneProgress = ({
  current,
  next,
  label,
  showPercentage = false,
  className
}: MilestoneProgressProps) => {
  const progress = Math.min((current / next) * 100, 100);
  const remaining = Math.max(next - current, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {showPercentage && (
          <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
        )}
      </div>
      
      <div className="relative">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-warning to-success transition-all duration-1000 ease-out animate-fade-in"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Milestone marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-2 border-background shadow-lg transition-all duration-1000"
          style={{ left: `${Math.min(progress, 95)}%` }}
        >
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>€{current.toFixed(2)}</span>
        <span className="font-medium text-primary">
          {remaining > 0 ? `€${remaining.toFixed(2)} rimanenti` : '🎉 Obiettivo raggiunto!'}
        </span>
        <span>€{next.toFixed(2)}</span>
      </div>
    </div>
  );
};
