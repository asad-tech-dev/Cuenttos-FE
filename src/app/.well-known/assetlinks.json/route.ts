export const dynamic = "force-static";

const ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.storyco.cuentto",
      // Play App Signing key, upload key, and debug key fingerprints.
      sha256_cert_fingerprints: [
        "11:24:88:B1:CE:B1:3A:FD:91:57:01:AE:0A:A6:42:87:77:82:B4:78:D0:B9:20:B5:92:35:62:15:F0:9C:37:59",
        "CC:BD:D6:F4:61:42:98:1B:CA:BB:D1:C6:A4:67:28:88:F5:E4:C1:E8:25:71:A1:2B:28:0F:39:73:53:A2:2D:E6",
        "84:1D:72:C4:72:AA:46:76:F0:07:42:A0:D3:3C:E7:AC:26:66:80:7A:7F:9C:4B:C2:A8:1B:46:5A:72:13:A5:2D",
      ],
    },
  },
];

export function GET() {
  return new Response(JSON.stringify(ASSET_LINKS), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
