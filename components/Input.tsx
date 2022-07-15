import theme from "@/styles/theme";
import { styled } from "@stitches/react";

export const Input = styled("input", {
	all: "unset",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: 4,
	padding: "0 12px",
	fontSize: "1rem", // browsers will zoom into input if less than 16px
	color: theme.colors.white,
	background: theme.colors.gray["900"],
	height: 48,

	"::placeholder": {
		color: theme.colors.gray["800"],
	},
});
