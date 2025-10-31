"use client";

import { useSyncDemo } from "@tldraw/sync";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Tldraw } from "tldraw";
import { api } from "@/convex/_generated/api";
import "tldraw/tldraw.css";

export default function AltarPage() {
  const params = useParams();
  const roomId = params.altarId as string;

  const altar = useQuery(api.altars.get, { roomId });

  const store = useSyncDemo({ roomId });

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
    <div className="h-screen w-screen">
      <Tldraw store={store} />
    </div>
  );
}
