import withPWAInit from "@ducanh2912/next-pwa";

// PWA Configuration Setup
const withPWA = withPWAInit({
  dest: "public", // Service worker files yahan generate hongi
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Dev mode mein caching off taaki coding mein dikkat na ho
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Config ko PWA wrapper ke sath export kar rahe hain
export default withPWA(nextConfig);
