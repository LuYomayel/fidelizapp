/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost"],
  },
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@shared"],

  // PWA Configuration
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 24 hours
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year
          },
        ],
      },
    ];
  },

  // PWA Rewrites para manejar offline
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite para el service worker
        {
          source: "/sw.js",
          destination: "/sw.js",
        },
      ],
      afterFiles: [
        // Fallback para páginas offline
        {
          source: "/((?!api|_next|icons|manifest.json|sw.js|offline.html).*)",
          destination: "/offline.html",
          has: [
            {
              type: "header",
              key: "purpose",
              value: "prefetch",
            },
          ],
        },
      ],
    };
  },

  // Configuración adicional para PWA
  async generateBuildId() {
    // Generar ID único para cada build (útil para cache busting)
    return `pwa-${Date.now()}`;
  },
};

module.exports = {
  ...nextConfig,
  typescript: {
    ignoreBuildErrors: false,
  },
};
