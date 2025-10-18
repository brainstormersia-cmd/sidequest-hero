import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  className,
}) => {
  const isOnFire = currentStreak >= 7;
  const isRecord = currentStreak === longestStreak && currentStreak > 0;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-fast",
              isOnFire
                ? "bg-gradient-to-br from-warning-500 to-destructive animate-pulse"
                : "bg-primary-600/20"
            )}
          >
            <Flame
              className={cn(
                "w-6 h-6",
                isOnFire ? "text-text-inverted" : "text-primary-600"
              )}
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {currentStreak}
            </p>
            <p className="text-xs text-text-muted">Giorni consecutivi</p>
          </div>
        </div>

        {/* Record Badge */}
        {isRecord && currentStreak > 0 && (
          <Badge variant="accent" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Record!
          </Badge>
        )}
      </div>

      {/* Longest Streak */}
      {longestStreak > currentStreak && (
        <div className="mt-3 pt-3 border-t border-border-default">
          <p className="text-xs text-text-muted">
            Record personale:{" "}
            <span className="font-semibold text-text-primary">
              {longestStreak} giorni
            </span>
          </p>
        </div>
      )}

      {/* Motivational Message */}
      {isOnFire && (
        <div className="mt-3 p-2 bg-warning-500/10 rounded-md border border-warning-500/20">
          <p className="text-xs text-center text-text-primary font-medium">
            🔥 Sei inarrestabile! Continua così!
          </p>
        </div>
      )}
    </Card>
  );
};
