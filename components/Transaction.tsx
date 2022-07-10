import { CheckCircle } from "./CheckCircle";
import * as Avatar from "@radix-ui/react-avatar";
import { Transaction as TransactionType } from "plaid";
import { tempStore } from "@/utils/store";
import { pick } from "ramda";
import { supabase } from "@/utils/supabaseClient";
import { displayAmount } from "./Amount";

const TRANSACTION_METADATA = [
	"account_id",
	"amount",
	"authorized_date",
	"category",
	"category_id",
	"date",
	"location",
	"merchant_name",
	"name",
	"payment_channel",
	"payment_meta",
	"pending",
	"transaction_id",
	"transaction_type",
];

export const Transaction = ({ transaction, gid }: { transaction: TransactionType; gid: any }) => {
	const sharedTransactions = tempStore((state) => state.sharedTransactions);
	const addTransactions = tempStore((state) => state.addTransactions);

	const isShared = sharedTransactions.find((y) => transaction.transaction_id === y.transaction_id);
	const isAdded = addTransactions.find((y) => transaction.transaction_id === y.transaction_id);
	const profile_id = supabase.auth.session()?.user?.id;

	const shareTransaction = async (
		transaction: TransactionType,
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

		const metadata = pick(TRANSACTION_METADATA, transaction);
		const req = { ...metadata, group_id: gid, charged_to: profile_id };

		return setAddTransactions([...addTransactions, req]);
	};

	return (
		<div
			key={transaction.transaction_id}
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
						<div className={"font-medium"}>{transaction.merchant_name}</div>
					</div>
					<div className={"font-mono font-medium tracking-tight shrink-0"}>
						{displayAmount(transaction.amount)}
					</div>
				</div>
				<div className={"flex justify-between"}>
					<div className={"text-gray-600"}>{transaction.name}</div>
					<div className={"font-mono font-medium tracking-tight text-gray-600 shrink-0"}>
						{transaction.date}
					</div>
				</div>
			</div>
		</div>
	);
};
