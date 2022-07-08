import React from "react";
import { styled } from "@stitches/react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import theme from "@/styles/theme";

const StyledSwitch = styled(SwitchPrimitive.Root, {
	all: "unset",
	width: 42,
	height: 25,
	backgroundColor: theme.colors.gray[800],
	borderRadius: "9999px",
	position: "relative",
	WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
	"&:focus": { boxShadow: `0 0 0 2px black` },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
	display: "block",
	width: 21,
	height: 21,
	backgroundColor: theme.colors.gray[700],
	borderRadius: "9999px",
	transition: "transform 100ms",
	transform: "translateX(2px)",
	willChange: "transform",
	'&[data-state="checked"]': { transform: "translateX(19px)", background: theme.colors.gradient.a },
});

// Exports
export const Switch = StyledSwitch;
export const SwitchThumb = StyledThumb;

// Your app...
const Flex = styled("div", { display: "flex" });
const Label = styled("label", {
	color: "white",
	fontSize: 15,
	lineHeight: 1,
	userSelect: "none",
});

const Toggle = ({ checked }: { checked: boolean }) => (
	<Switch checked={checked} id="s1">
		<SwitchThumb />
	</Switch>
);

export default Toggle;
