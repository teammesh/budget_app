import theme from "@/styles/theme";

export const Main = ({ children }: { children: any }) => (
	<div
		className={"h-full"}
		style={{
			background: theme.colors.black,
			color: theme.colors.white,
		}}
	>
		{children}
	</div>
);
