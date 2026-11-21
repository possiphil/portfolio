import type { NextConfig } from 'next';

// Static export: `next build` writes plain HTML/CSS/JS to ./out,
// which the Cloudflare Worker serves as static assets (see wrangler.jsonc).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
