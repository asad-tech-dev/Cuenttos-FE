// No file extension — Apple's CDN requires the exact path
// "apple-app-site-association" with no ".json" suffix.
export const dynamic = "force-static";

const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    details: [
      {
        appIDs: ["SKDAHC6ZN2.com.storycollc.cuentto"],
        components: [
          {
            "/": "/*/cuentto/*",
            comment: "Shared cuentto links (username/slug format)",
          },
          {
            "/": "/cuentto/*",
            comment: "Legacy shared cuentto links (id format)",
          },
          {
            "/": "//cuentto/*",
            comment: "Legacy links shared with a double slash",
          },
          {
            // Must precede "/prompt/*": the first matching component wins,
            // and the app can't open written Today's Prompts yet, so these
            // links stay on the web.
            "/": "/prompt/daily/*",
            exclude: true,
            comment: "Shared Today's Prompt links (web only for now)",
          },
          {
            "/": "/prompt/*",
            comment: "Shared prompt links",
          },
        ],
      },
    ],
  },
};

export function GET() {
  return new Response(JSON.stringify(APPLE_APP_SITE_ASSOCIATION), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
