import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryBar from "@/components/CategoryBar";
import DealsStrip from "@/components/DealsStrip";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <CategoryBar />
      <HeroBanner />
      <DealsStrip />
      <ProductGrid title="Best of Electronics" filter="electronics" />
      <ProductGrid title="All Products" />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
