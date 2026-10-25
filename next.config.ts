import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos liegen in Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Fotos werden im Browser verkleinert, ein Speichern mit mehreren Fotos passt in 4 MB
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
