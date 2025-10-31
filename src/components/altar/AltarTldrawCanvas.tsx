"use client";

import { useSync } from "@tldraw/sync";
import { useMemo } from "react";
import {
  defaultShapeUtils,
  type TLComponents,
  type TLUiOverrides,
  Tldraw,
} from "tldraw";
import { env } from "@/env";
import { getBookmarkPreview } from "@/lib/getBookmarkPreview";
import { multiplayerAssetStore } from "@/lib/multiplayerAssetStore";
import { CustomAssetShapeUtil } from "@/lib/tldraw/CustomAssetShape";
import { AssetLibraryPanel } from "./AssetLibraryPanel";
import "tldraw/tldraw.css";

// const WORKER_URL = env.NEXT_PUBLIC_TLDRAW_SYNC_URL;

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

interface AltarTldrawCanvasProps {
  roomId: string;
}

const customShapes = [...defaultShapeUtils, CustomAssetShapeUtil];

export function AltarTldrawCanvas({ roomId }: AltarTldrawCanvasProps) {
  // Connect to sync backend
  console.log(`${env.NEXT_PUBLIC_TLDRAW_SYNC_URL}/api/connect/${roomId}`);

  const store = useSync({
    uri: `${env.NEXT_PUBLIC_TLDRAW_SYNC_URL}/api/connect/${roomId}`,
    assets: multiplayerAssetStore,
    shapeUtils: customShapes,
    // onCreateBookmarkFromUrl: getBookmarkPreview,
  });

  return (
    <div className="absolute inset-0">
      <div className="tldraw__editor w-full h-full">
        <Tldraw
          store={store}
          shapeUtils={customShapes}
          components={customComponents}
          overrides={customOverrides}
          deepLinks
          onMount={(editor) => {
            // when the editor is ready, we need to register our bookmark unfurling service
            editor.registerExternalAssetHandler("url", getBookmarkPreview);
          }}
        >
          <AssetLibraryPanel />
        </Tldraw>
      </div>
    </div>
  );
}
