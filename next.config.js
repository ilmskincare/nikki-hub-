/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_PASSWORD: process.env.APP_PASSWORD,
  },
};

module.exports = nextConfig;
