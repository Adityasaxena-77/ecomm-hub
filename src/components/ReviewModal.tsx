import { useState } from "react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, X } from "lucide-react";
import { toast } from "sonner";

type ReviewMode = "feedback" | "review";

interface ReviewModalProps {
  product: Product;
  mode: ReviewMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewModal = ({ product, mode, open, onOpenChange }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
        toast.success("Photo added to review");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!feedback.trim()) {
      toast.error(`Please write your ${mode === "review" ? "review" : "feedback"}`);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would send the review/feedback to your backend
      console.log({
        productId: product.id,
        userName,
        rating,
        feedback,
        photo: mode === "review" ? photoUrl : undefined,
        mode,
      });

      toast.success(`${mode === "review" ? "Review" : "Feedback"} posted successfully! 🎉`, {
        description: `Your ${rating}-star ${mode} for ${product.name}`,
      });

      // Reset form
      setRating(0);
      setUserName("");
      setFeedback("");
      setPhotoUrl("");
      setHoverRating(0);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Failed to post ${mode}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const title = mode === "review" ? "Product Review" : "Feedback & Rating";
  const description = mode === "review"
    ? "Tell us how the product arrived and upload a photo if available."
    : "Share your feedback about the product and shopping experience.";
  const actionLabel = mode === "review" ? "Post Review" : "Post Feedback";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-card rounded-t-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-border"
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Star Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-medium text-foreground">
                  {rating}/5 stars
                </span>
              )}
            </div>
          </div>

          {/* Feedback / Review */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {mode === "review" ? "How did the product arrive?" : "Feedback about shopping/product"} <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder={
                mode === "review"
                  ? "Write how the product arrived, its condition, packaging, and any notes."
                  : "Share your experience with the product and shopping process."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {feedback.length}/500 characters
            </div>
          </div>

          {/* Photo Upload for Review */}
          {mode === "review" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Photo of the Product (Optional)
              </label>
              {photoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={photoUrl}
                    alt="Review"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPhotoUrl("")}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-medium text-foreground">Click to upload photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || !rating}
            >
              {loading ? "Posting..." : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
