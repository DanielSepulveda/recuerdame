import { TLAsset, TLAssetStore } from "tldraw";

const WORKER_URL = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL || "http://localhost:8787";

export const multiplayerAssetStore: TLAssetStore = {
  async upload(asset: TLAsset, file: File): Promise<string> {
    try {
      // Upload file to Worker backend
      const response = await fetch(`${WORKER_URL}/uploads`, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Return full URL to asset
      return `${WORKER_URL}${data.url}`;
    } catch (error) {
      console.error("Asset upload failed:", error);
      throw error;
    }
  },

  async resolve(asset: TLAsset): Promise<string | null> {
    // Assets are already stored as full URLs from upload()
    // If the asset has a src, return it directly
    if ("src" in asset && typeof asset.src === "string") {
      return asset.src;
    }

    return null;
  },
};
