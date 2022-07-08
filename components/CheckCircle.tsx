import { CheckIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";

export const CheckCircle = ({ checked, fulfilled }: { checked: boolean; fulfilled: boolean }) => (
	<div
		className={"w-6 h-6 flex items-center justify-center rounded-full"}
		style={{
			background: fulfilled
				? theme.colors.gradient.f
				: checked
				? theme.colors.gradient.b
				: theme.colors.gray[800],
		}}
	>
		<CheckIcon />
	</div>
);
