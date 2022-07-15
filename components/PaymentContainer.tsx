import theme from "@/styles/theme";
import DefaultAvatar from "boring-avatars";
import Image from "next/image";
import { TextGradient } from "./text";

export const PaymentContainer = ({
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
							<div className="grid grid-cols-[auto_1fr_auto] items-center">
								<div className={"flex items-center justify-center"}>
									{x.from_user.avatar_url ? (
										<Image
											src={x.from_user.avatar_url}
											className={"w-12 h-12 rounded-full"}
											height={48}
											width={48}
											alt={"from user avatar"}
										/>
									) : (
										<DefaultAvatar
											size={48}
											name={x.from_user.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									)}
								</div>
								<div className="text-sm text-center">
									{x.from_profile_id === profileId ? "You pay " : <>{x.from_user.username} pays </>}
									{x.to_user.username}
									<div className={"text-sm font-mono font-medium tracking-tight"}>
										<TextGradient gradient={theme.colors.gradient.f}>
											${Math.abs(x.amount)}
										</TextGradient>
									</div>
								</div>
								<div className={"flex items-center justify-center"}>
									{x.to_user.avatar_url ? (
										<Image
											src={x.to_user.avatar_url}
											className={"w-12 h-12 rounded-full"}
											height={48}
											width={48}
											alt={"to user avatar"}
										/>
									) : (
										<DefaultAvatar
											size={48}
											name={x.to_user.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									)}
								</div>
							</div>
						</div>
					))
				) : (
					<div className="text-xs p-3 flex justify-center text-gray-600">{emptyText}</div>
				)}
			</div>
		</div>
	);
};
