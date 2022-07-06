export interface ThemeColors {
	gray: Record<string, any>;
	white: string;
	black: string;
	overlayBg: string;
	gradient: {
		a: string;
		b: string;
		c: string;
		d: string;
		e: string;
		f: string;
	};
}

const colors: ThemeColors = {
	gray: {
		600: "rgba(115, 115, 126, 1)",
		700: "rgba(73, 73, 80, 1)",
		800: "rgba(23, 23, 26, 1)",
		900: "rgba(15, 16, 20, 1)",
	},
	white: "rgba(255, 255, 255, 1)",
	black: "rgba(0,0,0, 1)",
	overlayBg: "rgba(0,0,0, 0.7)",
	gradient: {
		a: "linear-gradient(152.26deg, #F6B364 0%, #9E58F6 101.41%)",
		b: "linear-gradient(152.26deg, #B353FF 0%, #F75D8B 101.41%)",
		c: "linear-gradient(152.26deg, #F74545 0%, #E1F664 101.41%)",
		d: "linear-gradient(152.26deg, #8A64F6 0%, #58C4F6 101.41%)",
		e: "linear-gradient(152.26deg, #E1F664 0%, #DF66FD 101.41%)",
		f: "linear-gradient(229.14deg, #94F533 -2.89%, #2AD0CA 84.74%)",
	},
};

const theme = { colors };

export default theme;
