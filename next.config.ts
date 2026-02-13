import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Support deployment at root or under a sub-path
  // Set BASE_PATH environment variable to deploy under a sub-path (e.g., /smart-git-blame)
  // Leave unset or empty to deploy at root
  basePath: process.env.BASE_PATH || '',
};

export default nextConfig;
