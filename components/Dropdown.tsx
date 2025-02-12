import React from "react";
import { keyframes, styled } from "@stitches/react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import theme from "@/styles/theme";

const slideUpAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(-2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateY(-2px)" },
	"100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
	"0%": { opacity: 0, transform: "translateX(2px)" },
	"100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(DropdownMenuPrimitive.Content, {
	minWidth: 220,
	backgroundColor: "white",
	borderRadius: 6,
	padding: 5,
	boxShadow:
		"0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
	"@media (prefers-reduced-motion: no-preference)": {
		animationDuration: "400ms",
		animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
		animationFillMode: "forwards",
		willChange: "transform, opacity",
		"&[data-state='open']": {
			"&[data-side='top']": { animationName: slideDownAndFade },
			"&[data-side='right']": { animationName: slideLeftAndFade },
			"&[data-side='bottom']": { animationName: slideUpAndFade },
			"&[data-side='left']": { animationName: slideRightAndFade },
		},
	},
});

const itemStyles = {
	all: "unset",
	fontSize: 13,
	lineHeight: 1,
	color: theme.colors.black,
	borderRadius: 3,
	display: "flex",
	alignItems: "center",
	height: 25,
	padding: "0 5px",
	position: "relative",
	paddingLeft: 25,
	userSelect: "none",

	"&[data-disabled]": {
		color: theme.colors.gray[600],
		pointerEvents: "none",
	},

	"&:focus": {
		backgroundColor: theme.colors.gray[900],
		color: theme.colors.white,
	},
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });
const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, { ...itemStyles });
const StyledRadioItem = styled(DropdownMenuPrimitive.RadioItem, { ...itemStyles });

const StyledItemIndicator = styled(DropdownMenuPrimitive.ItemIndicator, {
	position: "absolute",
	left: 0,
	width: 25,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
});

// Exports
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = StyledContent;
export const DropdownMenuItem = StyledItem;
export const DropdownMenuCheckboxItem = StyledCheckboxItem;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuRadioItem = StyledRadioItem;
export const DropdownMenuItemIndicator = StyledItemIndicator;
