import { Search, ShoppingCart, User, Menu, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card card-shadow">
      <div className="hero-gradient">
        <div className="container flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl md:text-2xl font-heading font-bold text-primary-foreground tracking-tight">
              Ecommerce Platform
            </span>
            <span className="hidden md:block text-[10px] italic -mt-2">
              <span className="text-primary-foreground/70">Explore </span>
              <span className="font-medium" style={{ color: "hsl(0, 80%, 70%)" }}>Plus</span>
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Input
              className="bg-card border-0 pr-10 h-10 rounded-md text-sm placeholder:text-muted-foreground"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setTimeout(() => document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" }), 200);
                }
              }}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          </div>

          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline text-sm truncate max-w-[100px]">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="h-4 w-4 mr-2" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/auth")}
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline text-sm">Login</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10 relative"
              onClick={() => setIsCartOpen(true)}
            >
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
