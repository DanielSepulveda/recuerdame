export interface BookmarkPreview {
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

/**
 * Extract metadata from URL for bookmark shapes
 * Simple implementation using fetch + HTML parsing
 */
export async function handleUnfurl(url: string): Promise<BookmarkPreview> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid URL protocol");
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "tldraw-bot/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const title =
      extractMetaTag(html, 'property="og:title"') ||
      extractMetaTag(html, 'name="twitter:title"') ||
      extractTitle(html) ||
      parsedUrl.hostname;

    const description =
      extractMetaTag(html, 'property="og:description"') ||
      extractMetaTag(html, 'name="twitter:description"') ||
      extractMetaTag(html, 'name="description"');

    const image =
      extractMetaTag(html, 'property="og:image"') ||
      extractMetaTag(html, 'name="twitter:image"');

    return {
      url,
      title,
      description,
      image,
    };
  } catch (error) {
    console.error("Unfurl error:", error);

    // Return minimal preview on error
    try {
      const parsedUrl = new URL(url);
      return {
        url,
        title: parsedUrl.hostname,
      };
    } catch {
      throw new Error("Invalid URL");
    }
  }
}

/**
 * Extract content from meta tag
 */
function extractMetaTag(html: string, attribute: string): string | undefined {
  const regex = new RegExp(
    `<meta\\s+${attribute}\\s+content="([^"]*)"`,
    "i",
  );
  const match = html.match(regex);
  if (match?.[1]) {
    return decodeHtmlEntities(match[1]);
  }

  // Try alternative order (content before attribute)
  const regexAlt = new RegExp(
    `<meta\\s+content="([^"]*)"\\s+${attribute}`,
    "i",
  );
  const matchAlt = html.match(regexAlt);
  if (matchAlt?.[1]) {
    return decodeHtmlEntities(matchAlt[1]);
  }

  return undefined;
}

/**
 * Extract title from <title> tag
 */
function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (match?.[1]) {
    return decodeHtmlEntities(match[1].trim());
  }
  return undefined;
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
