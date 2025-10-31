"use client";

import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import "tldraw/tldraw.css";

export default function AltarPage() {
  const params = useParams();
  const customId = params.altarId as string;

  const altar = useQuery(api.altars.get, { customId });

  const store = useSyncDemo({ roomId: customId });

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
