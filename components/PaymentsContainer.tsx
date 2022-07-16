import { Payment } from "./Payment";

export const PaymentsContainer = ({
	title,
	description,
	balances,
	emptyText,
	profileId,
}: {
	title: string;
	description: string;
	balances: Array<any>;
	emptyText: string;
	profileId?: string;
}) => {
	return (
		<div className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-6"}>
			<div className={"grid grid-cols-1 gap-1"}>
				<div className="text-sm">{title}</div>
				<div className="text-xs text-gray-600">{description}</div>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{balances.length > 0 ? (
					balances.map((x, i) => (
						<div key={x.id}>
							<Payment profile_id={profileId} from_user={x.from_user} to_user={x.to_user} amount={x.amount} />	
						</div>
					))
				) : (
					<div className="text-xs p-3 flex justify-center text-gray-600">{emptyText}</div>
				)}
			</div>
		</div>
	);
};
