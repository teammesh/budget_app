import theme from "@/styles/theme";
import Image from "next/image";
import DefaultAvatar from "boring-avatars";
import { TextGradient } from "./text";
import { PrimaryBox } from "@/components/boxes";
import { styled } from "@stitches/react";

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
					{from_user.avatar_url ? (
						<Image
							src={from_user.avatar_url}
							className={"w-8 h-8 rounded-full"}
							height={32}
							width={32}
							alt={"from user avatar"}
						/>
					) : (
						<DefaultAvatar
							size={32}
							name={from_user.username}
							variant="beam"
							colors={theme.colors.avatar}
						/>
					)}
					{to_user.avatar_url ? (
						<Image
							src={to_user.avatar_url}
							className={"w-8 h-8 rounded-full"}
							height={32}
							width={32}
							alt={"to user avatar"}
						/>
					) : (
						<DefaultAvatar
							size={32}
							name={to_user.username}
							variant="beam"
							colors={theme.colors.avatar}
						/>
					)}
				</ProfilePictureCont>
				<div className="text-sm leading-none grid-cols-1 grid gap-1">
					<div>
						<b>{from_user.username}</b> paid <b>{to_user.username}</b>
					</div>
					<div className={"flex justify-between"}>
						<div className={"font-mono font-medium tracking-tight"}>
							<TextGradient gradient={theme.colors.gradient.f}>${Math.abs(amount)}</TextGradient>
						</div>
						<div className={"font-mono font-medium tracking-tight text-gray-600"}>{date}</div>
					</div>
				</div>
			</div>
		</PrimaryBox>
	);
};
