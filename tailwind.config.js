/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				mono: ["Favorit Mono, Inconsolata, monospace"],
			},
			minHeight: {
				8: "24rem",
			},
			colors: {
				gray: {
					600: "rgba(115, 115, 126, 1)",
					700: "rgba(73, 73, 80, 1)",
					800: "rgba(23, 23, 26, 1)",
					900: "rgba(15, 16, 20, 1)",
				},
			},
		},
	},
	plugins: [],
};
