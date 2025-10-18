import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Star, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MissionCardV2Props {
  title: string;
  description?: string;
  price: number;
  escrowAmount: number;
  isKYCVerified: boolean;
  rating?: number;
  reviewCount?: number;
  location?: string;
  deadline?: string;
  category?: string;
  className?: string;
  onAccept?: () => void;
}

export const MissionCardV2: React.FC<MissionCardV2Props> = ({
  title,
  description,
  price,
  escrowAmount,
  isKYCVerified,
  rating = 0,
  reviewCount = 0,
  location,
  deadline,
  category,
  className,
  onAccept,
}) => {
  return (
    <Card className={cn("mission-card-v2 overflow-hidden", className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header with title and verification badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-text-primary truncate">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-text-muted line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          {isKYCVerified && (
            <Badge variant="success" className="flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              Verificato
            </Badge>
          )}
        </div>

        {/* Category badge */}
        {category && (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        )}

        {/* Escrow Trust Signal Widget */}
        <div className="flex items-center gap-2 p-3 bg-success-500/10 rounded-md border border-success-500/20">
          <Lock className="w-4 h-4 text-success-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted">Fondi protetti in escrow</p>
            <p className="text-sm font-semibold text-success-500">
              €{escrowAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Metadata row: Rating, Location, Deadline */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning-500 text-warning-500" />
              <span className="font-medium text-text-primary">
                {rating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-text-muted">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1 text-text-muted">
              <MapPin className="w-4 h-4" />
              <span className="text-xs truncate max-w-[120px]">{location}</span>
            </div>
          )}

          {/* Deadline */}
          {deadline && (
            <div className="flex items-center gap-1 text-text-muted">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{deadline}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="default"
          className="w-full font-semibold"
          onClick={onAccept}
        >
          Accetta missione - €{price.toFixed(2)}
        </Button>
      </CardContent>
    </Card>
  );
};
