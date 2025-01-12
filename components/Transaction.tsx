import { CheckCircle } from "./CheckCircle";
import * as Avatar from "@radix-ui/react-avatar";
import { tempStore } from "@/utils/store";
import * as R from "ramda";
import { supabase } from "@/utils/supabaseClient";
import { displayAmount } from "@/components/Amount";
import { definitions } from "@/types/supabase";
import { TRANSACTION_METADATA } from "@/constants/components.constants";

export const Transaction = ({
	transaction,
	gid,
	groupUsers,
}: {
	transaction: definitions["shared_transactions"];
	gid: any;
	groupUsers: any;
}) => {
	const sharedTransactions = tempStore((state) => state.sharedTransactions);
	const addTransactions = tempStore((state) => state.addTransactions);

	const isShared = R.any(
		(y) => transaction.transaction_id === y.transaction_id,
		R.values(sharedTransactions),
	);
	const isAdded = addTransactions.find((y) => transaction.transaction_id === y.transaction_id);
	const profile_id = supabase.auth.session()?.user?.id || "";

	const shareTransaction = async (
		transaction: definitions["shared_transactions"],
		isShared: boolean,
		isAdded: boolean,
	) => {
		if (isShared) return;

		const addTransactions = tempStore.getState().addTransactions;
		const setAddTransactions = tempStore.getState().setAddTransactions;

		if (isAdded)
			return setAddTransactions(
				addTransactions.filter((x) => x.transaction_id !== transaction.transaction_id),
			);

		const metadata = R.pick(TRANSACTION_METADATA, transaction);
		const splitAmountDivisor = 1 / R.values(groupUsers).length;
		let split_amounts = {};
		R.values(groupUsers).map((x: any) => {
			split_amounts = R.assocPath(
				[x.profile_id],
				transaction.amount * splitAmountDivisor,
				split_amounts,
			);
		});

		const newTransaction: definitions["shared_transactions"] = {
			...metadata,
			group_id: gid,
			charged_to: profile_id,
			split_amounts,
		};

		return setAddTransactions([...addTransactions, newTransaction]);
	};

	return (
		<div
			key={transaction.id}
			className={
				"p-3 rounded-md bg-gray-900 cursor-pointer grid grid-cols-[auto_1fr_auto] gap-3 text-sm items-center"
			}
			onClick={() => shareTransaction(transaction, isShared, isAdded)}
		>
			<CheckCircle fulfilled={isShared} checked={isAdded} />
			<div className={"grid grid-cols-1 gap-0.5 text-sm"}>
				<div className={"flex justify-between items-center"}>
					<div className={"grid grid-cols-[auto_auto] gap-2 items-center"}>
						<Avatar.Root>
							<Avatar.Image />
							<Avatar.Fallback>
								<div className={"bg-gray-800 rounded-full h-4 w-4"} />
							</Avatar.Fallback>
						</Avatar.Root>
						<div className={"font-medium text-ellipsis overflow-hidden whitespace-nowrap"}>
							{transaction.merchant_name}
						</div>
					</div>
					<div className={"font-mono font-medium tracking-tight shrink-0"}>
						{displayAmount(transaction.amount)}
					</div>
				</div>
				<div className={"flex justify-between"}>
					<div className={"text-gray-500 text-ellipsis overflow-hidden whitespace-nowrap"}>
						{transaction.name}
					</div>
					<div className={"font-mono font-medium tracking-tight text-gray-500 shrink-0"}>
						{transaction.date}
					</div>
				</div>
			</div>
		</div>
	);
};
