"use client";
import CallToAction from "@/components/CallToAction";
import Features from "@/components/Features";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <CallToAction />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">Hecho con ❤️ para honrar nuestras tradiciones</p>
          <p className="text-sm">
            © 2025 Recuerdame.app | Celebrando el Día de los Muertos.
          </p>
        </div>
      </footer>
    </div>
  );
}
