import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  currentLevel: string;
  nextLevel: string;
  progress: number;
  perks: string[];
  compact?: boolean;
  className?: string;
}

export const LevelBadge = ({
  currentLevel,
  nextLevel,
  progress,
  perks,
  compact = false,
  className
}: LevelBadgeProps) => {
  if (compact) {
    return (
      <Badge className={cn("bg-gradient-to-r from-primary/20 to-warning/20 text-foreground border-primary/30 px-3 py-1", className)}>
        <Award className="w-3 h-3 mr-1" />
        {currentLevel}
      </Badge>
    );
  }

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-primary/5 via-warning/5 to-success/5 border-primary/20 shadow-floating", className)}>
      <div className="flex items-start gap-4">
        {/* Progress Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Award className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Level Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-foreground">{currentLevel}</h3>
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {progress}%
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Prossimo livello: <span className="font-medium text-foreground">{nextLevel}</span>
          </p>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-primary via-warning to-success transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Perks */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-1">🎁 Vantaggi:</p>
            {perks.slice(0, 3).map((perk, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-foreground">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
