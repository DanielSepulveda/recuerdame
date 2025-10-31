"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroProps {
  isAuthenticated: boolean;
  onCtaClick: () => void;
}

const Hero = ({ isAuthenticated, onCtaClick }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden papel-picado">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-altar.jpg"
          alt="Altar de Día de los Muertos con flores de cempasúchil"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="animate-float">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 glow-text">
            Recuerdame
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Honra a tus seres queridos con un altar colaborativo
          </p>
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
            Crea, comparte y celebra juntos el Día de los Muertos desde
            cualquier lugar
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button
            variant="hero"
            size="lg"
            className="text-lg px-8 py-6 h-auto"
            onClick={onCtaClick}
          >
            {isAuthenticated ? "Ir a mis altares" : "Crear Mi Altar"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            Unirme a un Altar
          </Button>
        </div>

        {/* Floating Decorative Elements */}
        <div className="mt-16 flex justify-center gap-8 text-6xl animate-pulse">
          <span className="animate-float" style={{ animationDelay: "0s" }}>
            🌼
          </span>
          <span className="animate-float" style={{ animationDelay: "1s" }}>
            💀
          </span>
          <span className="animate-float" style={{ animationDelay: "2s" }}>
            🕯️
          </span>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
