/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['sagas.s3.ap-southeast-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sagas.s3.ap-southeast-2.amazonaws.com',
      },
    ]
  },
}

module.exports = nextConfig
