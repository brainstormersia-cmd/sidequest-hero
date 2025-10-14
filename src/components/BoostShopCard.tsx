import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type BoostPerk = { 
  icon?: React.ReactNode; 
  label: string; 
};

export type BoostCardProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  oldPrice?: string;
  durationLabel?: string;
  perks?: BoostPerk[];
  legalNote?: string;
  coverUrl?: string;
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  headerHeight?: number | string;
  imageLoading?: "lazy" | "eager";
  className?: string;
  onBuy?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export const BoostShopCard = ({
  badge,
  title,
  subtitle,
  description,
  price,
  oldPrice,
  durationLabel,
  perks = [],
  legalNote,
  coverUrl,
  imageFit = "cover",
  imagePosition = "center",
  headerHeight = 220,
  imageLoading = "lazy",
  className,
  onBuy,
}: BoostCardProps) => {
  const [imageError, setImageError] = useState(false);

  const heightValue = typeof headerHeight === "number" ? `${headerHeight}px` : headerHeight;
  const objectFitClass = imageFit === "cover" ? "object-cover" : "object-contain";
  const objectPositionClass = `object-${imagePosition}`;

  return (
    <Card className={cn(
      "w-full max-w-sm overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1",
      className
    )}>
      {/* Image Header */}
      <div 
        className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"
        style={{ height: heightValue }}
      >
        {/* Badge overlay */}
        {badge && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 right-3 z-10 font-bold text-xs shadow-lg"
          >
            {badge}
          </Badge>
        )}

        {/* Image or Placeholder */}
        {!imageError && coverUrl ? (
          <img
            src={coverUrl}
            alt={title || "Boost product"}
            loading={imageLoading}
            className={cn("w-full h-full", objectFitClass, objectPositionClass)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <ImageOff className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Immagine in arrivo</p>
          </div>
        )}
      </div>

      {/* Content */}
      <CardHeader className="pb-3">
        <div className="space-y-1">
          {subtitle && (
            <p className="text-xs font-medium text-primary uppercase tracking-wide">
              {subtitle}
            </p>
          )}
          {title && (
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
          )}
        </div>
        {description && (
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          {price && (
            <span className="text-2xl font-black text-foreground">{price}</span>
          )}
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through">{oldPrice}</span>
          )}
        </div>

        {/* Duration Label */}
        {durationLabel && (
          <p className="text-xs text-muted-foreground font-medium">
            ⏱️ {durationLabel}
          </p>
        )}

        {/* Perks List */}
        {perks.length > 0 && (
          <ul className="space-y-2">
            {perks.map((perk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                {perk.icon || <span className="text-primary">✓</span>}
                <span className="text-foreground leading-snug">{perk.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Legal Note */}
        {legalNote && (
          <p className="text-xs text-muted-foreground italic mt-2">
            {legalNote}
          </p>
        )}
      </CardContent>

      {/* Footer with CTA */}
      <CardFooter>
        <Button
          onClick={onBuy}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12 shadow-md hover:shadow-lg transition-all"
        >
          🛒 Acquista ora
        </Button>
      </CardFooter>
    </Card>
  );
};
