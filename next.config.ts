import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'i.imgur.com',
    },{
      protocol: 'https',
      hostname: 'img.clerk.com',
    }]
  },
  // webpack: (config) => {
  //   config.resolve.alias.canvas = false;

  //   return config;
  // }
};

export default nextConfig;
