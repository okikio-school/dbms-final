/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
		remotePatterns: [{ hostname: "images.pexels.com" }],
		remotePatterns: [{ hostname: "m.media-amazon.com" }],
	}
};

module.exports = nextConfig;
