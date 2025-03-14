/** @type {import('next').NextConfig} */
const config = {
	images: {
        domains: ['localhost', 'host.docker.internal'],
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '**',
          },
        ],
        unoptimized: true, // Thêm dòng này để tắt tối ưu hình ảnh
    },
	experimental: {
		typedRoutes: false,
	},
	// used in the Dockerfile
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
			  ? "export"
			  : undefined,
};

export default config;
