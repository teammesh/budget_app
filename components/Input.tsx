import theme from "@/styles/theme";
import { styled } from "@stitches/react";

export const Input = styled("input", {
	all: "unset",
	width: "100%",
	flex: "1",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: 4,
	padding: "0 10px",
	fontSize: "1rem", // browsers will zoom into input if less than 16px
	color: theme.colors.gray["600"],
	background: theme.colors.gray["900"],
	boxShadow: `0 0 0 1px ${theme.colors.gray["700"]}`,
	height: 35,

	"&:focus": { boxShadow: `0 0 0 2px ${theme.colors.gray["800"]}` },
});
