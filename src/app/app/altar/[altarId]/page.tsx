"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AltarTldrawCanvas } from "@/components/altar/AltarTldrawCanvas";
import { api } from "@/convex/_generated/api";

export default function AltarPage() {
  const params = useParams();
  const roomId = params.altarId as string;

  // const altar = useQuery(api.altars.get, { roomId });

  // if (altar === undefined) {
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center">
  //       <div className="text-muted-foreground">Cargando altar...</div>
  //     </div>
  //   );
  // }

  // if (altar === null) {
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center">
  //       <div className="text-muted-foreground">Altar no encontrado</div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col h-screen">
      {/* Header Navigation */}
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Tldraw Canvas */}
      <div className="flex-1 relative">
        <AltarTldrawCanvas roomId={roomId} />
      </div>
    </div>
  );
}
