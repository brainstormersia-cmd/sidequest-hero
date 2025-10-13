import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Target, ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { EarningsChart } from "@/components/EarningsChart";
import { MilestoneProgress } from "@/components/MilestoneProgress";
import { useNavigate } from "react-router-dom";
import { mockWeeklyEarnings } from "@/lib/mockData";

interface PersonalEarningsWidgetProps {
  totalEarnings: number;
  weeklyEarnings: number;
  weeklyChange: number;
  missionCount: number;
  nextMilestone: { value: number; label: string };
}

export const PersonalEarningsWidget = ({
  totalEarnings,
  weeklyEarnings,
  weeklyChange,
  missionCount,
  nextMilestone
}: PersonalEarningsWidgetProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-success/5 to-warning/5 border-primary/20 shadow-floating">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">I Tuoi Guadagni</h3>
            <p className="text-xs text-muted-foreground">{missionCount} missioni</p>
          </div>
        </div>
        <Badge className="bg-success/20 text-success border-success/30 self-start sm:self-auto">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{weeklyChange}%
        </Badge>
      </div>

      {/* Big Number */}
      <div className="mb-3 sm:mb-4">
        <div className="text-3xl sm:text-4xl font-black text-foreground mb-1">
          <AnimatedCounter 
            value={totalEarnings} 
            prefix="€"
            decimals={2}
            duration={1200}
            celebration
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Totale guadagnato • Questa settimana: 
          <span className="font-semibold text-success ml-1">€{weeklyEarnings}</span>
        </p>
      </div>

      {/* Sparkline Chart - Hidden on small mobile */}
      <div className="mb-3 sm:mb-4 hidden sm:block">
        <EarningsChart 
          data={mockWeeklyEarnings}
          variant="sparkline"
        />
      </div>

      {/* Milestone Progress */}
      <div className="mb-4">
        <MilestoneProgress
          current={totalEarnings}
          next={nextMilestone.value}
          label={nextMilestone.label}
          showPercentage
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-background/50 rounded-xl p-2 sm:p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground">{missionCount}</p>
          <p className="text-xs text-muted-foreground">Completate</p>
        </div>
        <div className="bg-background/50 rounded-xl p-2 sm:p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-primary">
            €{(totalEarnings / Math.max(missionCount, 1)).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">Media/missione</p>
        </div>
      </div>

      {/* CTA Button */}
      <Button 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-card h-11 sm:h-12 text-sm sm:text-base font-semibold group touch-manipulation"
        onClick={() => navigate('/wallet')}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Vai al Portafoglio
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Card>
  );
};
