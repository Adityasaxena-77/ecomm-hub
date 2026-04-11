import { useParams, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Heart, Star, ShoppingCart, ArrowLeft, Truck, Shield, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { toast } from "sonner";
import Reviews from "@/components/Reviews";
import ReviewModal from "@/components/ReviewModal";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-heading font-bold text-foreground mb-4">Product not found</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`, {
      description: `Quantity: ${quantity} • ₹${(product.price * quantity).toLocaleString()}`,
    });
  };

  const handleWishlist = () => {
    setLiked(!liked);
    toast(liked ? "Removed from wishlist" : "Added to wishlist ❤️", {
      description: product.name,
    });
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative bg-card rounded-xl overflow-hidden card-shadow">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 deal-gradient text-accent-foreground text-sm font-bold px-3 py-1 rounded-md">
                  {product.badge}
                </span>
              )}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1 bg-primary text-primary-foreground text-sm font-bold px-2 py-1 rounded-md">
                  {product.rating} <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {product.reviews.toLocaleString()} ratings & reviews
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewOpen(true)}
                  className="ml-auto border border-border hover:bg-secondary"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-lg font-bold text-accent">{product.discount}% off</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Inclusive of all taxes</p>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-secondary transition-colors rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-foreground border-x border-border">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-secondary transition-colors rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-8">
                <Button variant="hero" size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
                <Button variant="deal" size="lg" className="flex-1" onClick={handleAddToCart}>
                  Buy Now
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">7 Day Return</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Warranty</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h3 className="font-heading font-bold text-foreground mb-3">Product Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Experience the best quality with our {product.name}. This product comes with a {product.discount}% discount,
                  making it an incredible deal. Rated {product.rating}/5 by {product.reviews.toLocaleString()} customers.
                  Enjoy free delivery, easy returns, and manufacturer warranty with your purchase.
                </p>
              </div>

              <Reviews productId={product.id} />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-heading font-bold text-foreground mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="bg-card rounded-lg card-shadow hover:card-shadow-hover transition-all cursor-pointer overflow-hidden"
                  >
                    <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">{p.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-foreground">₹{p.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground line-through">₹{p.originalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <ReviewModal 
        product={product} 
        mode="review"
        open={reviewOpen} 
        onOpenChange={setReviewOpen} 
      />
    </div>
  );
};

export default ProductDetail;
