/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    NEXT_REDIS_CONNECTION: process.env.REDIS_CONNECTION,
    NEXT_INFURA_ID: process.env.INFURA_ID,
    NEXT_ALCHEMY_ID: process.env.ALCHEMY_ID,
  },
};

module.exports = nextConfig;
