import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  missionId: string;
  missionTitle: string;
  onSubmit: (data: { rating: number; comment: string; tags: string[] }) => Promise<void>;
  className?: string;
}

const quickTags = [
  { id: "professional", label: "Professionale", icon: "👔" },
  { id: "punctual", label: "Puntuale", icon: "⏰" },
  { id: "friendly", label: "Cordiale", icon: "😊" },
  { id: "quality", label: "Ottima qualità", icon: "⭐" },
  { id: "communicative", label: "Comunicativo", icon: "💬" },
  { id: "reliable", label: "Affidabile", icon: "🤝" },
];

export const ReviewForm = ({
  targetUserId,
  targetUserName,
  targetUserAvatar,
  missionId,
  missionTitle,
  onSubmit,
  className
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Seleziona una valutazione da 1 a 5 stelle");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        tags: selectedTags
      });
      
      // Reset form
      setRating(0);
      setComment("");
      setSelectedTags([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Errore nell'invio della recensione. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Lascia una recensione
          </h3>
        </div>
        <p className="text-sm text-text-muted">
          Come è stata la tua esperienza con <span className="font-medium text-text-primary">{targetUserName}</span> per la missione "{missionTitle}"?
        </p>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Valutazione *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="group transition-transform hover:scale-110 active:scale-95"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-smooth",
                  star <= displayRating
                    ? "fill-warning-500 text-warning-500"
                    : "text-neutral-300 dark:text-neutral-600 group-hover:text-warning-500/50"
                )}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm font-medium text-text-primary">
              {displayRating === 5 ? "Eccellente!" : 
               displayRating === 4 ? "Molto buono" : 
               displayRating === 3 ? "Buono" : 
               displayRating === 2 ? "Sufficiente" : 
               "Insufficiente"}
            </span>
          )}
        </div>
      </div>

      {/* Quick Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Tag veloci (opzionale)</Label>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-smooth hover:scale-105 text-sm px-3 py-1",
                selectedTags.includes(tag.id)
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "hover:border-brand-primary/50"
              )}
              onClick={() => handleTagToggle(tag.id)}
            >
              <span className="mr-1">{tag.icon}</span>
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-sm font-semibold">
          Commento (opzionale)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Condividi la tua esperienza in modo costruttivo..."
          className="min-h-[120px]"
          maxLength={500}
        />
        <p className="text-xs text-text-muted text-right">
          {comment.length}/500 caratteri
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-info-500/10 border border-info-500/20 rounded-lg p-4">
        <p className="text-xs text-text-muted leading-relaxed">
          💡 <span className="font-medium text-text-primary">Nota:</span>{" "}
          Le recensioni sono pubbliche e aiutano la community. Sii onesto ma rispettoso.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 h-12 font-semibold"
      >
        {isSubmitting ? "Invio in corso..." : "Pubblica recensione"}
      </Button>
    </Card>
  );
};
