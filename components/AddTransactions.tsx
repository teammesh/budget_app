import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore, tempStore } from "@/utils/store";
import { isEmpty, reverse, without } from "ramda";
import { Transaction as TransactionType } from "plaid";
import { ItemPublicTokenExchangeResponse } from "plaid/api";
import { PlaidLink } from "@/components/PlaidLink";
import { sortByDate } from "@/utils/helper";
import { styled } from "@stitches/react";
import { useAtom } from "jotai";
import { isToolbarShownAtom } from "@/components/Main";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Toggle from "@/components/Toggle";
import { Transaction } from "@/components/Transaction";
import { Header, TextGradient } from "@/components/text";

export default function AddTransactions({
	gid,
	setShowAddTransactions,
}: {
	gid: string;
	setShowAddTransactions: any;
}) {
	const profile_id = supabase.auth.session()?.user?.id;
	const [showAccounts, setShowAccounts] = useState<any>([]);
	const [transactions, setTransactions] = useState<any>([]);
	const accounts = sessionStore((state) => state.accounts);
	const [isToolbarShown] = useAtom(isToolbarShownAtom);
	const setAccounts = sessionStore.getState().setAccounts;
	const transactionCursor = sessionStore.getState().transactionCursor;
	const setTransactionCursor = sessionStore.getState().setTransactionCursor;
	const setAddTransactions = tempStore.getState().setAddTransactions;

	useEffect(() => {
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

		return () => setAddTransactions([]);
	}, []);

	const getTransactions = async (
		access_token: ItemPublicTokenExchangeResponse["access_token"],
		account_id: TransactionType["account_id"],
	) => {
		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(access_token)) {
			setShowAccounts(without([access_token], showAccounts));
			return setTransactions(
				transactions.filter((x: TransactionType) => x.account_id !== account_id),
			);
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
		setTransactions(
			reverse(sortByDate([...transactions, ...data.added.filter((x) => x.pending === false)])),
		);

		console.log(data);
		return;
	};

	const Container = styled("div", {
		position: "fixed",
		top: 0,
		bottom: isToolbarShown ? "124px" : "68px",
		left: 0,
		right: 0,
		zIndex: 99,
	});

	return (
		<Container className={"bg-black p-3 grid grid-cols-1 gap-4 content-start overflow-auto"}>
			<div className={"flex justify-between"}>
				<Button
					size={"sm"}
					style={{ background: theme.colors.gradient.a }}
					onClick={() => {
						setShowAddTransactions(false);
						tempStore.getState().setAddTransactions([]);
					}}
				>
					<ArrowLeftIcon />
					Cancel
				</Button>
				<PlaidLink />
			</div>
			<div className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-2 text-sm"}>
				{!isEmpty(accounts) &&
					accounts.map((x: ItemPublicTokenExchangeResponse) => (
						<div
							className={
								"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
							}
							onClick={() => getTransactions(x.access_token, x.account_id)}
							key={x.item_id}
						>
							<Toggle checked={showAccounts.includes(x.access_token)} />
							{x.name}
							<span className={"font-mono font-medium tracking-tight text-gray-600"}>
								•••• {x.last_four_digits}
							</span>
						</div>
					))}
			</div>
			<div className={"mt-6"}>
				<Header>
					Your <TextGradient gradient={theme.colors.gradient.a}>transactions</TextGradient>
				</Header>
				<div className={"grid grid-cols-1 gap-2"}>
					{!isEmpty(transactions) &&
						transactions.map((x: TransactionType) => (
							<Transaction gid={gid} transaction={x} key={x.transaction_id} />
						))}
				</div>
			</div>
		</Container>
	);
}
