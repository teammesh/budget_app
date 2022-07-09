import { TextGradient } from "@/components/text";
import theme from "@/styles/theme";
import { styled } from "@stitches/react";

const H2 = styled("h2", {
	"& > span": {
		fontFamily: "var(--custom-font-family-mono)",
	},
});

export const Widget = ({ amount, label }: { amount: number; label: string }) => (
	<div className={"p-4 rounded-md bg-gray-900"}>
		<h4 className={"text-sm mb-1"}>{label}</h4>
		<H2 className={"text-3xl font-mono font-light tracking-tighter"}>
			<TextGradient gradient={amount >= 0 ? theme.colors.gradient.f : theme.colors.gradient.b}>
				${amount.toFixed(2).toLocaleString().replace("-", "")}
			</TextGradient>
		</H2>
	</div>
);
