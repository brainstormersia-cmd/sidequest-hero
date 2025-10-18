import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface Review {
  id: string;
  reviewer: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt: Date;
  missionTitle?: string;
}

interface ReviewListProps {
  reviews: Review[];
  showMissionTitle?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ReviewList = ({
  reviews,
  showMissionTitle = false,
  emptyMessage = "Nessuna recensione disponibile",
  className
}: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Star className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {reviews.map((review) => (
        <Card key={review.id} className="p-4 hover:shadow-elegant transition-smooth">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={review.reviewer.avatar} />
              <AvatarFallback className="bg-brand-secondary/10 text-brand-secondary font-semibold">
                {getInitials(review.reviewer.name)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-text-primary text-sm truncate">
                      {review.reviewer.name}
                    </h4>
                    {review.reviewer.isVerified && (
                      <Badge variant="success" className="text-xs">
                        Verificato
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {formatDistanceToNow(review.createdAt, {
                      addSuffix: true,
                      locale: it
                    })}
                  </p>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= review.rating
                          ? "fill-warning-500 text-warning-500"
                          : "text-neutral-300 dark:text-neutral-600"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Mission Title */}
              {showMissionTitle && review.missionTitle && (
                <p className="text-xs text-text-muted mb-2">
                  Missione: <span className="font-medium text-text-primary">{review.missionTitle}</span>
                </p>
              )}

              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {review.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-text-primary leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
