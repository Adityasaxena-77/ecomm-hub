import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success("Added to cart!", {
      description: `${product.name} • ₹${product.price.toLocaleString()}`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    toast(liked ? "Removed from wishlist" : "Added to wishlist ❤️", {
      description: product.name,
    });
  };

  return (
    <div
      className="bg-card rounded-lg card-shadow hover:card-shadow-hover transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 deal-gradient text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
        <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-sm">
          {product.discount}% OFF
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="flex items-center gap-0.5 bg-primary text-primary-foreground text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
            {product.rating} <Star className="h-2.5 w-2.5 fill-current" />
          </span>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
