import theme, { ThemeColors } from "@/styles/theme";

export const Header = ({ children }: { children: any }) => {
	return (
		<h1 className={"text-2xl font-semibold mb-6 pl-2"} style={{ letterSpacing: -0.4 }}>
			{children}
		</h1>
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
			}}
		>
			{children}
		</span>
	);
};
