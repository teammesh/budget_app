import { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";
import { isEmpty, pick, reverse, sort, without } from "ramda";
import { Transaction } from "plaid";
import { ItemPublicTokenExchangeResponse } from "plaid/api";
import { Button } from "@chakra-ui/react";
import { PlaidLink } from "@/components/PlaidLink";
import { sortByDate } from "@/utils/helper";

export default function AddTransactions({
	gid,
	sharedTransactions,
	setSharedTransactions,
}: {
	gid: string;
	sharedTransactions: any[];
	setSharedTransactions: any;
}) {
	const [showAccounts, setShowAccounts] = useState<any>([]);
	const [transactions, setTransactions] = useState<any>([]);
	const accounts = sessionStore((state) => state.accounts);
	const setAccounts = sessionStore.getState().setAccounts;
	const transactionCursor = sessionStore.getState().transactionCursor;
	const setTransactionCursor = sessionStore.getState().setTransactionCursor;

	useEffect(() => {
		const profile_id = supabase.auth.session()?.user?.id;
		supabase
			.from("plaid_items")
			.select()
			.eq("profile_id", profile_id)
			.then(async ({ data, error }) => {
				if (!isEmpty(data) && data) {
					setAccounts(data);
					// fetch transactions for the first pm and display them
					await getTransactions(data[0].access_token, data[0].account_id);
					setShowAccounts([data[0].access_token]);
				}
			});
	}, []);

	const getTransactions = async (
		access_token: ItemPublicTokenExchangeResponse["access_token"],
		account_id: Transaction["account_id"],
	) => {
		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(access_token)) {
			setShowAccounts(without([access_token], showAccounts));
			return setTransactions(transactions.filter((x: Transaction) => x.account_id !== account_id));
		}

		const cursor = transactionCursor?.access_token;

		const data = await fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				cursor,
			}),
		}).then((res) => res.json());

		setTransactionCursor({ [access_token]: data.next_cursor });
		setShowAccounts([...showAccounts, access_token]);
		setTransactions(reverse(sortByDate([...transactions, ...data.added])));

		console.log(data);
		return;
	};

	const shareTransaction = async (transaction: Transaction) => {
		const metadata = pick(
			[
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
			],
			transaction,
		);
		const req = { ...metadata, group_id: gid, charged_to: supabase.auth.session()?.user?.id };
		const { data } = await supabaseQuery(
			() => supabase.from("shared_transactions").upsert(req),
			true,
		);
	};

	// account_id: '9a1a4NRBPAHKNJVbv7z8hGX9KkkBBnIV4r3bN',
	// account_owner: null,
	// amount: 5.4,
	// authorized_date: '2022-07-03',
	// authorized_datetime: null,
	// category: [Array],
	// category_id: '22016000',
	// check_number: null,
	// date: '2022-07-04',
	// datetime: null,
	// iso_currency_code: 'USD',
	// location: [Object],
	// merchant_name: 'Uber',
	// name: 'Uber 063015 SF**POOL**',
	// payment_channel: 'in store',
	// payment_meta: [Object],
	// pending: false,
	// pending_transaction_id: null,
	// personal_finance_category: null,
	// transaction_code: null,
	// transaction_id: 'eGAG7QMZg5TEGkzZe593SQwav97DkKi7onM5q',
	// transaction_type: 'special',
	// unofficial_currency_code: null

	return (
		<>
			<PlaidLink />
			{!isEmpty(accounts) &&
				accounts.map((x: ItemPublicTokenExchangeResponse) => (
					<div
						className={
							"p-3 text-purple-400 hover:text-purple-100 cursor-pointer bg-purple-100 border-2"
						}
						onClick={() => getTransactions(x.access_token, x.account_id)}
						key={x.item_id}
					>
						{x.name}
					</div>
				))}
			<div>
				<div className={"text-lg font-semibold"}>Transactions {transactions.length}</div>
				{!isEmpty(transactions) &&
					transactions.map((x: Transaction) => (
						<div key={x.transaction_id} className={"grid grid-cols-5"}>
							<div>{x.date}</div>
							<div>{x.merchant_name}</div>
							<div>{x.name}</div>
							<div>{x.amount}</div>
							{sharedTransactions.find((y) => x.transaction_id === y.transaction_id) ? (
								<Button onClick={() => console.log("added already")}>Added!</Button>
							) : (
								<Button onClick={() => shareTransaction(x)}>Add to group</Button>
							)}
						</div>
					))}
			</div>
		</>
	);
}
