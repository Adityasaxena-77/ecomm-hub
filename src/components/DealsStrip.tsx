import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const DealsStrip = () => {
  const deals = products.filter((p) => p.discount >= 55).slice(0, 4);

  return (
    <section className="bg-card py-6 border-y border-border">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-accent fill-accent" />
          <h2 className="text-xl font-heading font-bold text-foreground">Deals of the Day</h2>
          <span className="ml-auto text-sm text-primary font-medium hover:underline cursor-pointer">View All →</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deals.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-md object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs font-bold text-accent">{product.discount}% off</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsStrip;
