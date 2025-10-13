import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3x3 } from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-count'],
    queryFn: async () => {
      const { data: categoriesData, error } = await supabase
        .from('mission_categories')
        .select('id, name, icon, color')
        .order('name');
      
      if (error) throw error;
      
      // Count missions per category
      const withCounts = await Promise.all(
        (categoriesData || []).map(async (cat) => {
          const { count } = await supabase
            .from('missions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'open');
          
          return { ...cat, missionCount: count || 0 };
        })
      );
      
      return withCounts.sort((a, b) => b.missionCount - a.missionCount);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:ml-64">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Categorie</h1>
                <p className="text-sm text-muted-foreground">
                  Esplora tutte le categorie di missioni disponibili
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <Card
              key={category.id}
              className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-smooth"
              style={{
                borderColor: category.color + '40',
                backgroundColor: category.color + '08'
              }}
              onClick={() => navigate(`/missions?category=${category.id}`)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: category.color + '30',
                        color: category.color
                      }}
                    >
                      {category.missionCount} {category.missionCount === 1 ? 'missione' : 'missioni'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
