import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import DealsStrip from "@/components/DealsStrip";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { useSearch } from "@/context/SearchContext";

const Index = () => {
  const { searchQuery } = useSearch();
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <CategoryBar />
      {!isSearching && <HeroBanner />}
      {!isSearching && <DealsStrip />}
      <ProductGrid title={isSearching ? `Search Results for "${searchQuery}"` : "Best of Electronics"} filter={isSearching ? undefined : "electronics"} />
      <ProductGrid title="All Products" />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
