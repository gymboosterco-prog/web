/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Re-enable type checking during build for reliability
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
