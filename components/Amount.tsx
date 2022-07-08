import theme from "@/styles/theme";
import { TextGradient } from "@/components/text";

export const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export const displayAmount = (amount: number | bigint) => (
	<TextGradient gradient={amount >= 0 ? theme.colors.gradient.f : theme.colors.gradient.b}>
		{amount > 0 ? "+" : null}
		{formatter.format(amount)}
	</TextGradient>
);
