import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'knyskcdddvrvxjskdrpq.storage.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
     {
        protocol: 'https',
        hostname: 'pub-e4c77ee11db24f0da33f4c12309b140f.r2.dev',
        port: '',
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;
