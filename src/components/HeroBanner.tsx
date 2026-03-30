import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { bannerSlides } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[current];

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="container py-12 md:py-20 flex flex-col items-center text-center relative z-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-3 animate-fade-up">
          {slide.title}
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {slide.subtitle}
        </p>
        <Button variant="deal" size="lg" className="text-base animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {slide.cta} →
        </Button>

        {/* Dots */}
        <div className="flex gap-2 mt-8">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-accent" : "w-2 bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-accent/10" />
    </section>
  );
};

export default HeroBanner;
