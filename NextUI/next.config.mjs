const laravelInternal =
  process.env.LARAVEL_INTERNAL_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL?.trim() || "/api",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${laravelInternal}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${laravelInternal}/storage/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;
