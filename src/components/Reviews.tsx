import { useState } from "react";
import { Star, ThumbsUp, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  photos?: string[];
}

interface ReviewsProps {
  productId: number;
}

const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Rahul Sharma",
    rating: 5,
    text: "Excellent product! Exactly as described. Fast delivery and great quality.",
    date: "2024-04-10",
    helpful: 12,
  },
  {
    id: "2",
    userName: "Priya Patel",
    rating: 4,
    text: "Good product, but packaging could be better. Overall satisfied with the purchase.",
    date: "2024-04-08",
    helpful: 8,
  },
  {
    id: "3",
    userName: "Amit Kumar",
    rating: 5,
    text: "Amazing! Will definitely buy again. Customer service was also very helpful.",
    date: "2024-04-05",
    helpful: 15,
  },
];

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    text: ''
  });

  const handleHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleSubmitReview = () => {
    if (!newReview.userName.trim() || !newReview.text.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userName: newReview.userName,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ userName: '', rating: 5, text: '' });
    setShowForm(false);
    toast.success("Review submitted successfully!");
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-heading font-bold text-foreground mb-4">Customer Reviews</h3>

      {/* Rating Summary */}
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="outline">
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-card rounded-lg p-4 mb-6 border-2 border-dashed border-primary/20">
          <h4 className="font-medium text-foreground mb-4">Write Your Review</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
              <Input
                value={newReview.userName}
                onChange={(e) => setNewReview(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
              <Textarea
                value={newReview.text}
                onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview}>
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card rounded-lg p-4 border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{review.userName}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-foreground mb-2">{review.text}</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(review.date).toLocaleDateString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className={`w-4 h-4 ${helpfulVotes[review.id] ? 'fill-current' : ''}`} />
                Helpful ({review.helpful + (helpfulVotes[review.id] ? 1 : 0)})
              </Button>
            </div>
            {review.photos && review.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;