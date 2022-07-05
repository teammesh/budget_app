import { displayAmount } from "@/components/Amount";

export const Group = ({ group, ...props }: { group: any; props: any }) => (
	<div
		className="p-3 rounded-md bg-gray-900 grid grid-cols-[32px_1fr_auto] gap-3 items-center cursor-pointer"
		{...props}
	>
		<div className="flex-initial mr-3 rounded-full w-8 h-8 bg-gray-800" />
		<div className="block">
			<div className="text-sm">{group.groups.name}</div>
			<div className="text-sm text-gray-600">{group.groups.name}</div>
		</div>
		<div className="text-xl text-right">{displayAmount(group.amount)}</div>
	</div>
);
