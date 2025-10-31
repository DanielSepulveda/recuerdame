"use client";

import { UserButton } from "@clerk/nextjs";
import { useSync } from "@tldraw/sync";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tldraw, TLUiOverrides, TLComponents } from "tldraw";
import { api } from "@/convex/_generated/api";
import { multiplayerAssetStore } from "@/lib/multiplayerAssetStore";
import "tldraw/tldraw.css";

const WORKER_URL = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL || "http://localhost:8787";

// Hide PageMenu to prevent multi-page functionality
const customComponents: TLComponents = {
  PageMenu: null,
};

// Remove page management and export actions
const customOverrides: TLUiOverrides = {
  actions(editor, actions) {
    // Destructure to remove unwanted actions
    const {
      "move-to-new-page": _moveToNewPage,
      "change-page-prev": _changePrev,
      "change-page-next": _changeNext,
      "export-as-svg": _exportSvg,
      "export-as-png": _exportPng,
      "export-all-as-svg": _exportAllSvg,
      "export-all-as-png": _exportAllPng,
      "copy-as-svg": _copySvg,
      "copy-as-png": _copyPng,
      ...keepActions
    } = actions;
    return keepActions;
  },
};

export default function AltarPage() {
  const params = useParams();
  const roomId = params.altarId as string;

  const altar = useQuery(api.altars.get, { roomId });

  // Connect to production sync backend
  const wsUrl = WORKER_URL.replace(/^http/, "ws");
  const store = useSync({
    uri: `${wsUrl}/connect/${roomId}`,
    assets: multiplayerAssetStore,
  });

  if (altar === undefined) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando altar...</div>
      </div>
    );
  }

  if (altar === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-muted-foreground">Altar no encontrado</div>
      </div>
    );
  }

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
        <div className="absolute inset-0">
          <div className="tldraw__editor w-full h-full">
            <Tldraw
              store={store}
              components={customComponents}
              overrides={customOverrides}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
