import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { rootDomain } from "@/lib/utils";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }
    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

// Protect all /app routes (app subdomain)
const isProtectedRoute = createRouteMatcher(["/app(.*)", "/server"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const subdomain = extractSubdomain(req);

  // Handle app subdomain
  if (subdomain === "app") {
    // Rewrite to /app route
    const url = req.nextUrl.clone();
    url.pathname = `/app${pathname}`;

    // Protect the rewritten route
    await auth.protect();

    return NextResponse.rewrite(url);
  }

  // Protect other protected routes on root domain
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
