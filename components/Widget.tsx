export const Widget = ({ amount, label }: { amount: number; label: string }) => (
	<div className={"p-4 rounded-md bg-gray-900"}>
		<h4 className={"text-sm mb-1"}>{label}</h4>
		<h2 className={"text-3xl"}>{amount}</h2>
	</div>
);
