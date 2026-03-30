import { categories } from "@/data/products";

const CategoryBar = () => {
  return (
    <section className="bg-card border-b border-border py-4 overflow-x-auto">
      <div className="container">
        <div className="flex items-center gap-6 md:gap-8 justify-start md:justify-center min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className="flex flex-col items-center gap-1.5 group cursor-pointer shrink-0"
            >
              <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
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
