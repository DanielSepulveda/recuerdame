const WORKER_URL =
  process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL || "http://localhost:8787";

export interface BookmarkPreview {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

/**
 * Fetch bookmark preview from worker unfurl endpoint
 * Used by tldraw to show rich previews when URLs are pasted
 */
export async function getBookmarkPreview(
  url: string,
): Promise<BookmarkPreview> {
  try {
    const response = await fetch(
      `${WORKER_URL}/api/unfurl?url=${encodeURIComponent(url)}`,
    );

    if (!response.ok) {
      throw new Error(`Unfurl failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch bookmark preview:", error);

    // Return minimal preview on error
    try {
      const parsedUrl = new URL(url);
      return {
        url,
        title: parsedUrl.hostname,
      };
    } catch {
      return {
        url,
        title: url,
      };
    }
  }
}
