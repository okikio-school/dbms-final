/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
		remotePatterns: [{ hostname: "images.pexels.com" }],
	}
};

module.exports = nextConfig;
