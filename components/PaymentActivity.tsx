import { PrimaryBox } from "@/components/boxes";
import { styled } from "@stitches/react";
import { displayAmount } from "@/components/Amount";
import { Avatar } from "@/components/Avatar";

const ProfilePictureCont = styled("div", {
	height: "100%",
	width: "100%",
	position: "relative",

	"&>*": {
		position: "absolute !important",
	},
	":last-child": {
		right: 0,
	},
});

export const PaymentActivity = ({ payment }: { payment: any }) => {
	const { from_user, to_user, amount, created_at } = payment;

	let date: Date | string = new Date(created_at);
	date = `${date.getFullYear()}-${String(date.getUTCMonth()).padStart(2, "0")}-${String(
		date.getUTCDate(),
	).padStart(2, "0")}`;

	return (
		<PrimaryBox>
			<div className={"grid grid-cols-[48px_1fr] gap-4 items-center"}>
				<ProfilePictureCont>	
					<Avatar avatarUrl={from_user.avatar_url} avatarName={from_user.username} />
					<Avatar avatarUrl={to_user.avatar_url} avatarName={to_user.username} />
				</ProfilePictureCont>
				<div className="text-sm leading-none grid-cols-1 grid gap-1">
					<div>
						<b>{from_user.username}</b> paid <b>{to_user.username}</b>
					</div>
					<div className={"flex justify-between"}>
						<div className={"font-mono font-medium tracking-tight"}>{displayAmount(amount)}</div>
						<div className={"font-mono font-medium tracking-tight text-gray-600"}>{date}</div>
					</div>
				</div>
			</div>
		</PrimaryBox>
	);
};
