/** @type {import('next').NextConfig} */
const config = {
	images: {
		domains: ['localhost', 'host.docker.internal', 'saleor-api.fly.dev'],
		remotePatterns: [
			{
				hostname: '*',
			},
		],
	},
	experimental: {
		typedRoutes: false,
	},
	webpack: (config, { isServer }) => {
		// Xử lý cho môi trường client (browser)
		if (!isServer) {
		  // Điều này không chỉ bỏ qua module 'canvas' mà còn các file liên quan
		  config.resolve.alias.canvas = false;
		  
		  // Thêm các module Node.js khác mà cần bỏ qua
		  config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			os: false,
		  };
		}
		
		// Thêm rule cho file .node
		config.module.rules.push({
		  test: /\.node$/,
		  use: 'null-loader',
		});
		
		return config;
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
