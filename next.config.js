/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["lh3.googleusercontent.com", "otgircdxfltyohmcmrso.supabase.co"],
	},
	experimental: {
		images: {
			allowFutureImage: true,
		},
		outputFileTracingIncludes: {
			"/": ["./client/*"],
		},
	},
};

module.exports = nextConfig;
