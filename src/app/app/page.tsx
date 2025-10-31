"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

export default function AppHome() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const createAltar = useMutation(api.altars.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAltar = async () => {
    try {
      setIsCreating(true);
      const altarId = await createAltar({});
      router.push(`/app/altar/${altarId}`);
    } catch (error) {
      console.error("Error creating altar:", error);
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-xl font-bold">
              Recuerdame
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/app"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/app/altares"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Mis Altares
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Landing
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Bienvenido, {user?.firstName || "Usuario"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Crea y comparte altares digitales para honrar a tus seres queridos.
          </p>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <button
              onClick={handleCreateAltar}
              disabled={isCreating}
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {isCreating ? "Creando..." : "Crear Altar"}
              </h2>
              <p className="text-muted-foreground">
                Comienza un nuevo altar para honrar a un ser querido
              </p>
            </button>

            <Link
              href="/app/altares"
              className="border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer block"
            >
              <h2 className="text-2xl font-semibold mb-2">Mis Altares</h2>
              <p className="text-muted-foreground">
                Ver y administrar tus altares existentes
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
