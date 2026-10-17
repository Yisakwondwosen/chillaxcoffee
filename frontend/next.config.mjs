/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    const djangoBackend = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/django-api/:path*',
        destination: `${djangoBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
