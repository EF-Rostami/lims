import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  const rootDomain = "my-lims.com";
  const subdomain = hostname.replace(`.${rootDomain}`, "");

  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === `api.${rootDomain}`
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-workspace", subdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}