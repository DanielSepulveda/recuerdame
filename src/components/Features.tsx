import { Palette, Share2, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Lienzo Colaborativo",
    description:
      "Invita a familiares y amigos a construir el altar juntos en tiempo real, sin importar dónde se encuentren.",
    color: "text-[hsl(30,95%,55%)]",
  },
  {
    icon: Sparkles,
    title: "IA Generativa",
    description:
      "Crea elementos únicos con inteligencia artificial. Genera flores, velas, y decoraciones personalizadas.",
    color: "text-[hsl(320,75%,50%)]",
  },
  {
    icon: Share2,
    title: "Compartir Públicamente",
    description:
      "Comparte tu altar con el mundo. Honra a tus seres queridos y permite que otros los recuerden también.",
    color: "text-[hsl(175,60%,40%)]",
  },
  {
    icon: Palette,
    title: "Personalización Total",
    description:
      "Crea tus propios elementos, sube fotos, agrega mensajes y diseña un altar verdaderamente único.",
    color: "text-[hsl(30,95%,55%)]",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            Características Principales
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para crear un altar digital memorable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-2 border-border hover:border-[hsl(30,95%,55%)]/50 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_hsl(30,95%,55%,0.4)] group"
            >
              <div
                className={`mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-[hsl(30,95%,55%)] transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
