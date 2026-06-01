import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Skip internal Next.js paths, static files, and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".") // captures favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  const rootDomain = "my-lims.com";
  
  // Clean up subdomain tracking
  const isRoot = hostname === rootDomain || hostname === `www.${rootDomain}`;
  const isApi = hostname === `api.${rootDomain}`;

  if (isRoot || isApi) {
    return NextResponse.next();
  }

  // Extract subdomain (handles nested variations cleanly)
  const subdomain = hostname.replace(`.${rootDomain}`, "");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-workspace", subdomain);

  // Optional: Rewrite the URL internally if you use Next.js multi-tenant routing folder structures, 
  // but if you're just consuming the header in Server Components/APIs, this next step is perfect:
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}