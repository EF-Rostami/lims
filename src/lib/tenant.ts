const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "app", "mail", "admin", "static", "assets", "cdn",
]);

/**
 * Returns the tenant slug from the current hostname subdomain, or null if
 * we are on a bare domain / reserved subdomain / localhost without a prefix.
 *
 * Examples:
 *   tenant1.blims.com  → "tenant1"
 *   tenant1.localhost  → "tenant1"   (Chrome/Firefox resolve *.localhost natively)
 *   localhost          → null
 *   www.blims.com      → null
 */
export function getTenantSlugFromHost(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length < 2) return null;
  const sub = parts[0];
  if (RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

/** True when the user reached the app via a tenant subdomain. */
export function isSubdomainMode(): boolean {
  return getTenantSlugFromHost() !== null;
}
