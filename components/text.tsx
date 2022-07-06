import theme from "@/styles/theme";

export const Header = ({ children }: { children: any }) => {
	return (
		<h1 className={"text-2xl font-semibold mb-6 pl-2"} style={{ letterSpacing: -0.4 }}>
			{children}
		</h1>
	);
};

export default function ({ children }: { children: any }) {
	return (
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
}
