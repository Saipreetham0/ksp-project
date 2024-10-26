// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   turbo: true,
  // },
  transpilePackages: ["@opentelemetry/instrumentation", "@sentry/node"],

  images: {
    domains: [], // Add any external image domains you're using
  },
};

module.exports = nextConfig;
