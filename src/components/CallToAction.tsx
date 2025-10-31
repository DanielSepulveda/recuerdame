import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[hsl(30,95%,55%)] rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-40 h-40 bg-[hsl(320,75%,50%)] rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[hsl(175,60%,40%)] rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 glow-text">
              Comienza Tu Altar Hoy
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Únete a familias que ya están honrando a sus seres queridos de
              manera especial
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              variant="hero"
              size="lg"
              className="text-xl px-12 py-7 h-auto animate-glow"
            >
              Crear Mi Altar
            </Button>
            <Button
              variant="festive"
              size="lg"
              className="text-xl px-12 py-7 h-auto"
            >
              Ver Altares Públicos
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-12 max-w-xl mx-auto mt-16 pt-16 border-t border-border/50">
            <div className="text-center">
              <div className="text-4xl font-bold text-[hsl(30,95%,55%)] mb-2">
                1000+
              </div>
              <div className="text-sm text-muted-foreground">
                Altares Creados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[hsl(320,75%,50%)] mb-2">
                5000+
              </div>
              <div className="text-sm text-muted-foreground">Usuarios</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
