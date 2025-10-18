import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterValues {
  priceRange: [number, number];
  distanceKm?: number;
  categories: string[];
  urgent: boolean;
  verified: boolean;
}

interface MissionFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  className?: string;
}

const categoryOptions = [
  { id: "delivery", label: "Consegne", icon: "🚛" },
  { id: "pet", label: "Pet sitting", icon: "🐕" },
  { id: "shopping", label: "Spesa", icon: "🛒" },
  { id: "handyman", label: "Lavori", icon: "🔨" },
  { id: "cleaning", label: "Pulizie", icon: "✨" },
  { id: "moving", label: "Traslochi", icon: "📦" },
];

export const MissionFilters = ({
  filters,
  onFiltersChange,
  className
}: MissionFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      priceRange: [0, 500],
      distanceKm: undefined,
      categories: [],
      urgent: false,
      verified: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleCategory = (categoryId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const activeFiltersCount = 
    localFilters.categories.length + 
    (localFilters.urgent ? 1 : 0) + 
    (localFilters.verified ? 1 : 0) +
    (localFilters.distanceKm ? 1 : 0) +
    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 500 ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 touch-manipulation relative",
            activeFiltersCount > 0 && "border-brand-primary",
            className
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtri</span>
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-brand-primary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtra missioni</SheetTitle>
          <SheetDescription>
            Personalizza i risultati secondo le tue preferenze
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Compenso (€{localFilters.priceRange[0]} - €{localFilters.priceRange[1]})
            </Label>
            <Slider
              value={localFilters.priceRange}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, priceRange: value as [number, number] }))
              }
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>€0</span>
              <span>€500+</span>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Distanza massima {localFilters.distanceKm ? `(${localFilters.distanceKm} km)` : "(tutte)"}
            </Label>
            <Slider
              value={[localFilters.distanceKm || 50]}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, distanceKm: value[0] }))
              }
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>1 km</span>
              <span>50 km</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocalFilters(prev => ({ ...prev, distanceKm: undefined }))}
              className="text-xs h-7"
            >
              Rimuovi limite distanza
            </Button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Categorie</Label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((cat) => (
                <Button
                  key={cat.id}
                  variant={localFilters.categories.includes(cat.id) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "justify-start gap-2 h-auto py-3",
                    localFilters.categories.includes(cat.id) && "bg-brand-primary text-white"
                  )}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Filtri rapidi</Label>
            <div className="space-y-2">
              <Button
                variant={localFilters.urgent ? "default" : "outline"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  localFilters.urgent && "bg-warning-500 text-white"
                )}
                onClick={() => setLocalFilters(prev => ({ ...prev, urgent: !prev.urgent }))}
              >
                🔥 Solo missioni urgenti
              </Button>
              <Button
                variant={localFilters.verified ? "default" : "outline"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  localFilters.verified && "bg-success-500 text-white"
                )}
                onClick={() => setLocalFilters(prev => ({ ...prev, verified: !prev.verified }))}
              >
                ✅ Solo utenti verificati
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Resetta
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Applica filtri
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
