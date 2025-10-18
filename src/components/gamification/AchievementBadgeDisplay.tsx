import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgeDisplayProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export const AchievementBadgeDisplay: React.FC<
  AchievementBadgeDisplayProps
> = ({ achievement, size = "md", showDescription = true, className }) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const rarityColors = {
    common: "from-muted to-muted-foreground",
    rare: "from-info-500 to-primary-600",
    epic: "from-primary-600 to-accent-500",
    legendary: "from-warning-500 to-destructive",
  };

  const getRarityBadgeVariant = (
    rarity: Achievement["rarity"]
  ): "default" | "info" | "primary" | "warning" => {
    switch (rarity) {
      case "rare":
        return "info";
      case "epic":
        return "primary";
      case "legendary":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-normal hover:scale-105",
        !achievement.isUnlocked && "opacity-50 grayscale",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Achievement Icon */}
        <div className="relative">
          <div
            className={cn(
              "rounded-full flex items-center justify-center relative overflow-hidden",
              sizeClasses[size],
              achievement.isUnlocked
                ? `bg-gradient-to-br ${
                    rarityColors[achievement.rarity || "common"]
                  }`
                : "bg-surface border-2 border-border-default"
            )}
          >
            {achievement.isUnlocked ? (
              achievement.icon || <Award className="w-8 h-8 text-text-inverted" />
            ) : (
              <Lock className="w-6 h-6 text-text-muted" />
            )}
          </div>
          {achievement.isUnlocked && achievement.rarity === "legendary" && (
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-warning-500 animate-pulse" />
          )}
        </div>

        {/* Achievement Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={cn(
                "font-semibold truncate",
                achievement.isUnlocked ? "text-text-primary" : "text-text-muted"
              )}
            >
              {achievement.name}
            </h4>
            {achievement.rarity && achievement.rarity !== "common" && (
              <Badge
                variant={getRarityBadgeVariant(achievement.rarity)}
                className="text-[10px] px-1.5 py-0"
              >
                {achievement.rarity}
              </Badge>
            )}
          </div>
          {showDescription && (
            <p className="text-xs text-text-muted line-clamp-2">
              {achievement.description}
            </p>
          )}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-[10px] text-text-muted mt-1">
              Sbloccato il{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString("it-IT")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Grid component to display multiple achievements
interface AchievementGridProps {
  achievements: Achievement[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  columns = 3,
  className,
}) => {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {achievements.map((achievement) => (
        <AchievementBadgeDisplay
          key={achievement.id}
          achievement={achievement}
          size="md"
          showDescription={true}
        />
      ))}
    </div>
  );
};
