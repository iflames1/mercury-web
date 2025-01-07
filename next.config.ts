import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["assets.hiro.so"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "assets.hiro.so",
				pathname: "/**",
			},
		],
	},
	/* config options here */
};

export default nextConfig;
