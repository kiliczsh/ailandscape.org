/**
 * Append UTM parameters to an external URL.
 * Skips URLs that already contain utm_ params.
 */
export function appendUtm(
  url: string | undefined,
  medium: "website" | "repo" | "x" = "website",
): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.searchParams.has("utm_source")) return url;
    u.searchParams.set("utm_source", "ailandscape");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", medium);
    return u.toString();
  } catch {
    return url;
  }
}
