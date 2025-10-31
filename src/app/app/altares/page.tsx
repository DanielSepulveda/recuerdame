"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AltarsTableWrapper } from "@/components/altars/altars-table-wrapper";
import { JoinAltarDialog } from "@/components/altars/JoinAltarDialog";

export default function AltaresPage() {
  return (
    <NuqsAdapter>
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
                  className="text-sm text-foreground hover:text-foreground transition-colors font-medium"
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Mis Altares</h1>
                <p className="text-muted-foreground">
                  Altares que has creado y aquellos en los que colaboras
                </p>
              </div>
              <JoinAltarDialog />
            </div>

            <AltarsTableWrapper />
          </div>
        </main>
      </div>
    </NuqsAdapter>
  );
}
