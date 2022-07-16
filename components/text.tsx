import theme, { ThemeColors } from "@/styles/theme";
import { styled } from "@stitches/react";

export const Header = ({ children, active }: { children: any; active?: boolean }) => {
	return <h1 className={"text-2xl font-semibold tracking-tight relative mb-6 pb-2"}>{children}</h1>;
};

export const PaginatedHeader = ({ children, active }: { children: any; active?: boolean }) => {
	const HeaderStyle = styled("h1", {
		color: active ? theme.colors.white : theme.colors.gray[700],

		"&:before": {
			content: "",
			position: "absolute",
			top: "calc(100% - 4px)",
			width: "100%",
			height: 2,
			background: active ? theme.colors.gradient.a : "transparent",
		},
	});

	return (
		<HeaderStyle className={"text-2xl font-semibold tracking-tight relative"}>
			{children}
		</HeaderStyle>
	);
};

export const TextGradient = ({
	children,
	gradient,
}: {
	children: any;
	gradient:
		| ThemeColors["gradient"]["a"]
		| ThemeColors["gradient"]["b"]
		| ThemeColors["gradient"]["c"]
		| ThemeColors["gradient"]["d"]
		| ThemeColors["gradient"]["e"]
		| ThemeColors["gradient"]["f"];
}) => {
	return (
		<span
			style={{
				background: gradient,
				WebkitBackgroundClip: "text",
				WebkitTextFillColor: "transparent",
				fontFamily: "inherit",
				fontSize: "inherit",
			}}
		>
			{children}
		</span>
	);
};
