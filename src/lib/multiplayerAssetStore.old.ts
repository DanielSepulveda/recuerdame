import type { TLAsset, TLAssetStore } from "tldraw";

const WORKER_URL =
  process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL || "http://localhost:8787";

export const multiplayerAssetStore: TLAssetStore = {
  async upload(asset: TLAsset, file: File) {
    try {
      // Generate unique asset ID
      const assetId = crypto.randomUUID();

      // Upload file to Worker backend
      const response = await fetch(`${WORKER_URL}/api/uploads/${assetId}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Return asset URL in expected format
      return {
        src: `${WORKER_URL}/api/assets/${assetId}`,
      };
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
