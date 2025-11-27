/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    webpackBuildWorker: true,
  },
  reactStrictMode: false,
  output: "standalone",
  serverRuntimeConfig: {
    COMMIT_HASH: process.env.COMMIT_HASH,
    COMMIT_TITLE: process.env.COMMIT_TITLE,
    COMMIT_AUTHOR: process.env.COMMIT_AUTHOR,
    COMMIT_TIMESTAMP: process.env.COMMIT_TIMESTAMP,
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
    NEXT_PUBLIC_SERVER_SIDE_API_HOST:
      process.env.NEXT_PUBLIC_SERVER_SIDE_API_HOST,
    NEXT_PUBLIC_API_IMAGE: process.env.NEXT_PUBLIC_API_IMAGE,
    NEXT_PUBLIC_IMAGE_HOST: process.env.NEXT_PUBLIC_IMAGE_HOST,
    NEXT_PUBLIC_WEBSOCKET_HOST: process.env.NEXT_PUBLIC_WEBSOCKET_HOST,
    NEXT_API_HOST: process.env.NEXT_API_HOST,
    NEXT_PUBLIC_RPC_NETWORK: process.env.NEXT_PUBLIC_RPC_NETWORK,
    NEXT_PUBLIC_RPC_NETWORK_WS: process.env.NEXT_PUBLIC_RPC_NETWORK_WS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_FINGERPRINT_KEY: process.env.NEXT_PUBLIC_FINGERPRINT_KEY,
    NEXT_PUBLIC_TELEGRAM_BOT_LINK: process.env.NEXT_PUBLIC_TELEGRAM_BOT_LINK,
    NEXT_PUBLIC_API_VIDEO: process.env.NEXT_PUBLIC_API_VIDEO,
  },
  async rewrites() {
    return [
      {
        source: "/healthcheck",
        destination: "/healthcheck",
      },
      {
        source: "/healthcheck/ping",
        destination: "/healthcheck/ping",
      },
      {
        source: "/",
        destination: "/home",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/(.*)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000",
          },
        ],
      },
      {
        source: "/favicon.ico",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
