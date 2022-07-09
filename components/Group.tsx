import { displayAmount } from "@/components/Amount";
import { forwardRef } from "react";
import { styled } from "@stitches/react";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import theme from "@/styles/theme";

const Amount = styled("div", {
	"& > span": {
		fontFamily: "var(--custom-font-family-mono)",
	},
});

export const Group = forwardRef(({ group, ...props }: { group: any; props?: any }, ref) => (
	<div
		className="p-3 rounded-md bg-gray-900 grid grid-cols-[32px_1fr_auto] gap-3 items-center cursor-pointer"
		{...props}
		// @ts-ignore
		ref={ref}
	>
		<Avatar.Root>
			<Avatar.Image />
			<Avatar.Fallback>
				<DefaultAvatar
					size={32}
					name={group.groups.name}
					variant="marble"
					colors={theme.colors.avatar}
				/>
			</Avatar.Fallback>
		</Avatar.Root>
		<div className="block">
			<div className="text-sm">{group.groups.name}</div>
			<div className="text-sm text-gray-600">{group.groups.name}</div>
		</div>
		<Amount className="text-sm font-medium font-mono tracking-tight">
			{displayAmount(group.amount_owed)}
		</Amount>
	</div>
));
