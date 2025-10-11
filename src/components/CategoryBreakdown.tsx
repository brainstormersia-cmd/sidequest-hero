import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  categories: {
    name: string;
    earnings: number;
    count: number;
    color: string;
    icon: string;
  }[];
  className?: string;
}

export const CategoryBreakdown = ({ categories, className }: CategoryBreakdownProps) => {
  const totalEarnings = categories.reduce((sum, cat) => sum + cat.earnings, 0);
  
  // Sort by earnings descending
  const sortedCategories = [...categories].sort((a, b) => b.earnings - a.earnings);

  return (
    <div className={cn("space-y-3", className)}>
      {sortedCategories.map((category, index) => {
        const percentage = (category.earnings / totalEarnings) * 100;
        
        return (
          <div 
            key={category.name}
            className="group cursor-pointer hover:scale-[1.02] transition-bounce"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} missioni</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">€{category.earnings}</p>
                <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: category.color,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
