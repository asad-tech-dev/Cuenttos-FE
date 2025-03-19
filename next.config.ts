/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
