import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  requirement?: number;
  className?: string;
}

export const AchievementCard = ({
  title,
  description,
  icon,
  unlocked,
  unlockedAt,
  progress = 0,
  className
}: AchievementCardProps) => {
  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-300",
        unlocked 
          ? "bg-gradient-to-br from-primary/10 to-warning/10 border-primary/30 shadow-card hover:shadow-floating" 
          : "bg-muted/30 border-muted opacity-60 hover:opacity-80",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
          unlocked ? "bg-primary/20" : "bg-muted"
        )}>
          {unlocked ? icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn(
              "font-semibold text-sm leading-tight",
              unlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {title}
            </h4>
            {unlocked && (
              <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-0">
                ✓
              </Badge>
            )}
          </div>
          
          <p className={cn(
            "text-xs leading-relaxed",
            unlocked ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {description}
          </p>

          {/* Progress bar for locked achievements */}
          {!unlocked && progress > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/50 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% completato</p>
            </div>
          )}

          {/* Unlocked date */}
          {unlocked && unlockedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Sbloccato il {new Date(unlockedAt).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
      </div>

      {/* Celebration effect for unlocked */}
      {unlocked && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-fade-in" />
        </div>
      )}
    </Card>
  );
};
