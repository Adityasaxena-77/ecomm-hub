import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useSearch } from "@/context/SearchContext";

const ProductGrid = ({ title, filter }: { title: string; filter?: string }) => {
  const { searchQuery, activeCategory } = useSearch();

  const isSearching = searchQuery.trim().length > 0;

  // When searching, only show in the "All Products" grid (no filter prop)
  // to avoid duplicate results across multiple grids
  if (isSearching && filter) return null;

  let filtered = products;

  // Apply category filter only when NOT searching
  if (!isSearching) {
    const categoryFilter = activeCategory || filter;
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }
  }

  // Apply search filter
  if (isSearching) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
  }

  if (filtered.length === 0) return null;

  return (
    <section className="py-8" id={filter ? `product-grid-${filter}` : "product-grid"}>
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} products</span>
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
