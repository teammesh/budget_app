import theme from "@/styles/theme";
import Image from "next/image";
import DefaultAvatar from "boring-avatars";
import { TextGradient } from "./text";
import { definitions } from "types/supabase";

export const Payment = ({
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
				{from_user.avatar_url ? (
					<Image
						src={from_user.avatar_url}
						className={"w-12 h-12 rounded-full"}
						height={48}
						width={48}
						alt={"from user avatar"}
					/>
				) : (
					<DefaultAvatar
						size={48}
						name={from_user.username}
						variant="beam"
						colors={theme.colors.avatar}
					/>
				)}
			</div>
			<div className="text-sm text-center">
				{from_user.id === profile_id ? `You ${word} ` 
                : <>{from_user.username} {wordPlural} </>} {to_user.username}
				<div className={"text-sm font-mono font-medium tracking-tight"}>
					<TextGradient gradient={theme.colors.gradient.f}>${Math.abs(amount)}</TextGradient>
				</div>
			</div>
			<div className={"flex items-center justify-center"}>
				{to_user.avatar_url ? (
					<Image
						src={to_user.avatar_url}
						className={"w-12 h-12 rounded-full"}
						height={48}
						width={48}
						alt={"to user avatar"}
					/>
				) : (
					<DefaultAvatar
						size={48}
						name={to_user.username}
						variant="beam"
						colors={theme.colors.avatar}
					/>
				)}
			</div>
		</div>
	);
};
