import theme from "@/styles/theme";

export const Header = ({ children }: { children: any }) => {
	return (
		<h1 className={"text-2xl font-semibold mb-6 pl-2"} style={{ letterSpacing: -0.4 }}>
			{children}
		</h1>
	);
};

export const TextGradient = ({ children }: { children: any }) => (
	<span
		style={{
			background: theme.colors.gradient.a,
			WebkitBackgroundClip: "text",
			WebkitTextFillColor: "transparent",
		}}
	>
		{children}
	</span>
);
