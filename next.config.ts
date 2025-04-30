/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://atos-capital-backend-docker.onrender.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig

