// The public web address previews link back to. Crawlers need absolute URLs
// for og:image / og:url, and Next resolves the relative ones against this.
const FALLBACK_SITE_URL = "https://cuentto.com";

export const siteUrl = (): URL => {
  try {
    return new URL(process.env.NEXT_PUBLIC_MAIN_APP_URL || FALLBACK_SITE_URL);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
};
