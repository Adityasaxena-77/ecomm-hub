import { categories } from "@/data/products";
import { useSearch } from "@/context/SearchContext";

const CategoryBar = () => {
  const { activeCategory, setActiveCategory } = useSearch();

  return (
    <section className="bg-card border-b border-border py-4 overflow-x-auto">
      <div className="container">
        <div className="flex items-center gap-6 md:gap-8 justify-start md:justify-center min-w-max">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex flex-col items-center gap-1.5 group cursor-pointer shrink-0 ${!activeCategory ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200">🏪</span>
            <span className={`text-xs font-medium transition-colors ${!activeCategory ? "text-primary font-bold" : "text-muted-foreground group-hover:text-primary"}`}>
              All
            </span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
              className={`flex flex-col items-center gap-1.5 group cursor-pointer shrink-0 ${activeCategory === cat.slug ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className={`text-xs font-medium transition-colors ${activeCategory === cat.slug ? "text-primary font-bold" : "text-muted-foreground group-hover:text-primary"}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;
