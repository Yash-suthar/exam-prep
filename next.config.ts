import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
