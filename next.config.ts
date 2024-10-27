// next.config.js
/** @type {import('next').NextConfig} */

const nextConfig = {
  // experimental: {
  //   turbo: true,
  // },
  // transpilePackages: ["@opentelemetry/instrumentation", "@sentry/node"],

  // images: {
  //   domains: [
  //     "gstatic.com",
  //      "lh3.googleusercontent.com"
  //   ], // Allowed image domains
  // },



  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // Allows any path on this domain
      },
      {
        protocol: "https",
        hostname: "gstatic.com",
        pathname: "/**", // Allows any path on this domain
      },
    ],
  },
};

module.exports = nextConfig;
