import type { NextConfig } from "next";
import path from "path";

if (!process.env.NEXT_TEST_WASM_DIR) {
  process.env.NEXT_TEST_WASM_DIR = path.resolve(__dirname, "node_modules/@next/swc-wasm-nodejs");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rqtlosgxektygbkuaylw.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
