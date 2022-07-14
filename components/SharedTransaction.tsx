import theme from "@/styles/theme";
import DefaultAvatar from "boring-avatars";
import { forwardRef } from "react";
import { definitions } from "../types/supabase";
import Image from "next/image";

export const SharedTransaction = forwardRef(
	(
		{
			transaction,
			groupUsers,
			...props
		}: { transaction: definitions["shared_transactions"] | any; groupUsers: any; props?: any },
		ref,
	) => {
		return (
			<div
				className={"p-3 rounded-md bg-gray-900 cursor-pointer grid grid-cols-1 gap-0.5 text-sm"}
				{...props}
				// @ts-ignore
				ref={ref}
			>
				<div className={"flex justify-between items-center"}>
					<div className={"grid grid-cols-[auto_auto] gap-2 items-center"}>
						<div className={"flex items-center justify-center"}>
							<div className={"flex items-center justify-center"}>
								{transaction.profiles.avatar_url ? (
									<Image
										src={transaction.profiles.avatar_url}
										className={"w-6 h-6 rounded-full"}
										height={16}
										width={16}
									/>
								) : (
									<DefaultAvatar
										size={16}
										name={transaction.profiles.username}
										variant="beam"
										colors={theme.colors.avatar}
									/>
								)}
							</div>
						</div>
						<div className={"font-medium"}>{transaction.merchant_name}</div>
					</div>
					<div className={"font-mono font-medium tracking-tight"}>
						${transaction?.amount?.toFixed(2)}
					</div>
				</div>
				<div className={"flex justify-between"}>
					<div className={"text-gray-600"}>{transaction.name}</div>
					<div className={"font-mono font-medium tracking-tight text-gray-600"}>
						{transaction.date}
					</div>
				</div>
			</div>
		);
	},
);
