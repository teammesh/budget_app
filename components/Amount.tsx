import theme from "@/styles/theme";
import { TextGradient } from "@/components/text";

export const formatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 2,
	minimumFractionDigits: 2,
});

export const displayAmount = (amount: number | bigint | undefined) => {
	return amount ? (
		<TextGradient gradient={amount >= 0 ? theme.colors.gradient.f : theme.colors.gradient.b}>
			{amount > 0 ? "+" : null}
			{formatter.format(amount)}
		</TextGradient>
	) : null;
};
