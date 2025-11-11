/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : null;

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async rewrites() {
    if (!backendUrl) {
      console.warn(
        'NEXT_PUBLIC_API_URL is not defined, skipping /api/backend proxy rewrite.'
      );
    }

    return backendUrl
      ? [
          {
            source: '/api/backend/:path*',
            destination: `${backendUrl}/:path*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
