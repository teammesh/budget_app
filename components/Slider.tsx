import React from "react";
import { styled } from "@stitches/react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { SliderProps } from "@radix-ui/react-slider";
import theme from "@/styles/theme";

const StyledSlider = styled(SliderPrimitive.Root, {
	position: "relative",
	display: "flex",
	alignItems: "center",
	userSelect: "none",
	touchAction: "none",
	width: "100%",

	"&[data-orientation='horizontal']": {
		height: 20,
	},

	"&[data-orientation='vertical']": {
		flexDirection: "column",
		width: 20,
		height: 100,
	},
});

const StyledTrack = styled(SliderPrimitive.Track, {
	backgroundColor: theme.colors.gray["800"],
	position: "relative",
	flexGrow: 1,
	borderRadius: "9999px",

	"&[data-orientation='horizontal']": { height: 3 },
	"&[data-orientation='vertical']": { width: 3 },
});

const StyledRange = styled(SliderPrimitive.Range, {
	position: "absolute",
	backgroundColor: "white",
	borderRadius: "9999px",
	height: "100%",
});

const StyledThumb = styled(SliderPrimitive.Thumb, {
	all: "unset",
	display: "block",
	width: 20,
	height: 20,
	backgroundColor: "white",
	boxShadow: `0 2px 10px ${theme.colors.gray["700"]}`,
	borderRadius: 10,
	// "&:hover": { backgroundColor: violet.violet3 },
	// "&:focus": { boxShadow: `0 0 0 5px ${blackA.blackA8}` },
});

export const Slider = ({ ...props }: SliderProps) => (
	<StyledSlider defaultValue={[50]} max={100} step={1} aria-label="amount" {...props}>
		<StyledTrack>
			<StyledRange />
		</StyledTrack>
		<StyledThumb />
	</StyledSlider>
);
