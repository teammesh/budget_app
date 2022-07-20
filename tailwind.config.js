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
			width: {
				mobile: "100%",
			},
			colors: {
				gray: {
					500: "rgba(115, 115, 126, 1)",
					600: "#41414D",
					700: "#24262B",
					800: "rgba(23, 23, 26, 1)",
					900: "rgba(15, 16, 20, 1)",
				},
			},
		},
	},
	plugins: [],
};
