/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images from i.ibb.co (and your local /public folder by default)
    domains: ["i.ibb.co"],

    // Optional (for more flexibility in Next.js 15+)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

export default nextConfig;
