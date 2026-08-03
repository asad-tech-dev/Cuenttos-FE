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
