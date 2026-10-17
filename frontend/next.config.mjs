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
    const djangoBackend = process.env.NEXT_PUBLIC_DJANGO_API_URL;
    if (djangoBackend) {
      return [
        {
          source: '/django-api/:path*',
          destination: `${djangoBackend}/api/:path*`,
        },
      ];
    }
    return [
      {
        source: '/django-api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
