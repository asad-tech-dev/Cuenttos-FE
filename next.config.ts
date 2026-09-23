/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allowed `quality` values for next/image (required from Next.js 16).
    // 75 is the default; 100 is used by the full-bleed cover/hero images.
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend.cuentto.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
