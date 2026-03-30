import { Search, ShoppingCart, User, Menu, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-card card-shadow">
      {/* Top bar */}
      <div className="hero-gradient">
        <div className="container flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl md:text-2xl font-heading font-bold text-primary-foreground tracking-tight">
              Ecommerce Platform
            </span>
            <span className="hidden md:block text-[10px] italic -mt-2">
              <span className="text-primary-foreground/70">Explore </span><span className="font-medium" style={{ color: "hsl(0, 80%, 70%)" }}>Plus</span>
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Input
              className="bg-card border-0 pr-10 h-10 rounded-md text-sm placeholder:text-muted-foreground"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <User className="h-4 w-4 mr-1" />
              <span className="hidden md:inline text-sm">Login</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="hidden md:inline text-sm">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-3 py-2 bg-card">
        <div className="relative">
          <Input
            className="bg-secondary border-0 pr-10 h-9 text-sm"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default Header;
