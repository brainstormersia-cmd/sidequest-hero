import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  showTrending?: boolean;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  currentXP,
  nextLevelXP,
  showTrending = true,
  className,
}) => {
  const progressPercentage = Math.min((currentXP / nextLevelXP) * 100, 100);
  const xpRemaining = nextLevelXP - currentXP;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with Level Badge and XP */}
      <div className="flex items-center justify-between">
        <Badge
          variant="primary"
          className="flex items-center gap-2 px-3 py-1.5"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span className="font-semibold">Livello {level}</span>
        </Badge>
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">
            {currentXP.toLocaleString()} XP
          </p>
          <p className="text-xs text-text-muted">
            {xpRemaining.toLocaleString()} per il prossimo livello
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-3" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">
            {progressPercentage.toFixed(0)}% completato
          </span>
          {showTrending && progressPercentage > 50 && (
            <span className="flex items-center gap-1 text-success-500 font-medium">
              <TrendingUp className="w-3 h-3" />
              In crescita!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
