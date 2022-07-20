import { forwardRef } from "react";
import { definitions } from "../types/supabase";
import { PrimaryBox } from "@/components/boxes";
import { Avatar } from "@/components/Avatar";

export const SharedTransaction = forwardRef(
	(
		{
			transaction,
			...props
		}: { transaction: definitions["shared_transactions"] | any; props?: any },
		ref,
	) => {
		return (
			<PrimaryBox
				{...props}
				// @ts-ignore
				ref={ref}
			>
				<div className={"flex justify-between items-center"}>
					<div className={"grid grid-cols-[auto_auto] gap-2 items-center"}>
						<div className={"flex items-center justify-center"}>
							<div className={"flex items-center justify-center"}>
								<Avatar
									avatarUrl={transaction.profiles.avatar_url}
									avatarName={transaction.profiles.username}
									size={16}
								/>
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
			</PrimaryBox>
		);
	},
);
