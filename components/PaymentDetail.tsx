import { definitions } from "types/supabase";
import { displayAmount } from "./Amount";
import Avatar from "boring-avatars";

export const PaymentDetail = ({
	profile_id,
	from_user,
	to_user,
	amount,
	paid = false,
}: {
	profile_id: string | any;
	from_user: definitions["profiles"] | any;
	to_user: definitions["profiles"] | any;
	amount: number | any;
	paid?: boolean;
}) => {
	const word = paid ? "paid" : "pay";
	const wordPlural = paid ? "paid" : "pays";

	return (
		<div className="grid grid-cols-[auto_1fr_auto] items-center">
			<div className={"flex items-center justify-center"}>
				<Avatar avatarUrl={from_user.avatar_url} avatarName={from_user.username} size={48} />
			</div>
			<div className="text-sm text-center">
				{from_user.id === profile_id ? (
					`You ${word} `
				) : (
					<>
						{from_user.username} {wordPlural}{" "}
					</>
				)}{" "}
				{to_user.username}
				<div className={"text-sm font-mono font-medium tracking-tight"}>
					{displayAmount(amount)}
				</div>
			</div>
			<div className={"flex items-center justify-center"}>
				<Avatar avatarUrl={to_user.avatar_url} avatarName={to_user.username} size={48} />
			</div>
		</div>
	);
};
