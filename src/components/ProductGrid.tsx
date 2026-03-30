import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const ProductGrid = ({ title, filter }: { title: string; filter?: string }) => {
  const filtered = filter ? products.filter((p) => p.category === filter) : products;

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">{title}</h2>
          <button className="text-sm font-medium text-primary hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
