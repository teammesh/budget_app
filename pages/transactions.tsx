import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";
import { isEmpty, reverse, sort } from "ramda";

export default function Transactions() {
	const accounts = sessionStore((state) => state.accounts);
	const setAccounts = sessionStore.getState().setAccounts;
	const transactions = sessionStore((state) => state.transactions);
	const setTransactions = sessionStore.getState().setTransactions;
	const transactionCursor = sessionStore.getState().transactionCursor;
	const setTransactionCursor = sessionStore.getState().setTransactionCursor;

	useEffect(() => {
		const profile_id = supabase.auth.session()?.user?.id;

		supabase
			.from("plaid_items")
			.select()
			.eq("profile_id", profile_id)
			.then(({ data, error }) => setAccounts(data));
	}, []);

	useEffect(() => {
		if (accounts.length === 0) return;
	}, [accounts]);

	const getTransactions = (access_token) => {
		fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				transactionCursor,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				const diff = function (a, b) {
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				};

				setTransactionCursor(data.next_cursor);
				setTransactions(reverse(sort(diff, data.added)));
			});
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
			{!isEmpty(accounts) &&
				accounts.map((x) => (
					<div
						className={
							"p-3 text-purple-400 hover:text-purple-100 cursor-pointer bg-purple-100 border-2"
						}
						onClick={() => getTransactions(x.access_token)}
						key={x.item_id}
					>
						{x.item_id}
					</div>
				))}
			<div>
				<div className={"text-lg font-semibold"}>Transactions</div>
				{!isEmpty(transactions) &&
					transactions.map((x) => (
						<div key={x.transaction_id} className={"grid grid-cols-4"}>
							<div>{x.authorized_date}</div>
							<div>{x.merchant_name}</div>
							<div>{x.name}</div>
							<div>{x.amount}</div>
						</div>
					))}
			</div>
		</>
	);
}
