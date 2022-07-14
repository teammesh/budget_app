import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore, tempStore } from "@/utils/store";
import * as R from "ramda";
import { assocPath } from "ramda";
import { Transaction as TransactionType } from "plaid";
import { ItemPublicTokenExchangeResponse } from "plaid/api";
import { plaidLinkUpdate } from "@/components/plaidLink";
import { sortByDate } from "@/utils/helper";
import { styled } from "@stitches/react";
import { useAtom } from "jotai";
import { isToolbarShownAtom } from "@/components/Main";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon, ExclamationTriangleIcon, ExitIcon, PlusIcon } from "@radix-ui/react-icons";
import Toggle from "@/components/Toggle";
import { Transaction } from "@/components/Transaction";
import { Header, TextGradient } from "@/components/text";
import { Loading } from "@/components/Loading";
import Script from "next/script";
import * as Dialog from "@radix-ui/react-dialog";
import { Content } from "./Modal";

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
	const [isLoading, setIsLoading] = useState<any>(true);
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
				if (data && !R.isEmpty(data)) {
					setAccounts(R.indexBy(R.prop("access_token"), data));
					// fetch transactions for the first pm and display them
					await getTransactions(data[0].access_token, data[0].account_id);

					// const response = await fetch("/api/plaidGetBalances", {
					// 	method: "post",
					// 	body: JSON.stringify({
					// 		access_token: "access-development-3ab682d2-9a9c-4c12-b5cd-60e344550673",
					// 	}),
					// }).catch((error) => console.error(error));
					//
					// // @ts-ignore
					// const { balances } = response.json();

					// const balance = await client.accountsBalanceGet({
					// 	access_token: "access-development-70e98bbf-3bbb-4948-b4f3-2f02c66e9b2d",
					// });
					//
					// console.log(balance);

					// await fetch("/api/plaidRemoveItem", {
					// 	method: "post",
					// 	body: JSON.stringify({
					// 		access_token: "access-development-8abe0e35-22c3-416e-9be2-11ff74494d11",
					// 	}),
					// }).catch((error) => console.error(error));
				}
				setIsLoading(false);
			});

		fetch("/api/plaidCreateLinkToken", {
			method: "post",
			body: JSON.stringify({
				profile_id: supabase.auth.session()?.user?.id,
			}),
		}).then((res) =>
			res.json().then((token) => {
				tempStore.getState().setLinkToken(token);
			}),
		);

		return () => setAddTransactions([]);
	}, []);

	const getTransactions = async (
		access_token: ItemPublicTokenExchangeResponse["access_token"],
		account_id: TransactionType["account_id"],
	) => {
		setIsLoading(true);
		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(access_token)) {
			setShowAccounts(R.without([access_token], showAccounts));
			setTransactions(transactions.filter((x: TransactionType) => x.account_id !== account_id));
			return setIsLoading(false);
		}

		const cursor = transactionCursor?.access_token;

		const data = await fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				cursor,
			}),
		}).then((res) => res.json());

		// remove from showAccounts and flag the pm for re-authentication
		if (data?.error?.error_code === "ITEM_LOGIN_REQUIRED") {
			setAccounts(assocPath([access_token, "invalid"], true, accounts));
			setShowAccounts(R.without([access_token], showAccounts));
			setIsLoading(false);
			return;
		}

		// if (data?.error?.error_code === "ITEM_LOGIN_REQUIRED") {
		// 	fetch("/api/plaidCreateLinkToken", {
		// 		method: "post",
		// 		body: JSON.stringify({
		// 			profile_id: supabase.auth.session()?.user?.id,
		// 			access_token,
		// 		}),
		// 	}).then((res) =>
		// 		res.json().then((token) => {
		// 			tempStore.getState().setLinkToken(token);
		// 			setIsLoading(false);
		// 			return window.Plaid.create(plaidLinkUpdate({ setIsLoading, linkToken: token })).open();
		// 		}),
		// 	);
		// }

		setTransactionCursor({ [access_token]: data.next_cursor });
		setShowAccounts([...showAccounts, access_token]);
		setTransactions(
			R.reverse(
				sortByDate([...transactions, ...data.added.filter((x: any) => x.pending === false)]),
			),
		);

		console.log(data);
		return setIsLoading(false);
	};

	const Container = styled("div", {
		position: "fixed",
		top: 0,
		bottom: isToolbarShown ? "124px" : "68px",
		left: 0,
		right: 0,
		zIndex: 10,
	});

	const reauthenticatePlaid = (access_token: ItemPublicTokenExchangeResponse["access_token"]) => {
		setIsLoading(true);
		fetch("/api/plaidCreateLinkToken", {
			method: "post",
			body: JSON.stringify({
				profile_id: supabase.auth.session()?.user?.id,
				access_token,
			}),
		}).then((res) =>
			res.json().then((token) => {
				tempStore.getState().setLinkToken(token);
				return window.Plaid.create(
					plaidLinkUpdate({ setIsLoading, linkToken: token, access_token }),
				).open();
			}),
		);
	};

	const Account = () => {
		const arr: any[] = [];

		R.forEachObjIndexed((account: ItemPublicTokenExchangeResponse, accessToken) => {
			if (account.invalid) {
				arr.push(
					<Dialog.Root>
						<Dialog.Trigger asChild>
							<div
								className={
									"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
								}
								key={account.item_id}
							>
								<Toggle checked={showAccounts.includes(account.access_token)} />
								<div
									className={"grid grid-cols-[auto_auto] gap-2 items-center place-content-start"}
								>
									{<ExclamationTriangleIcon color={theme.colors.avatar[0]} />}
									{account.name}
								</div>
								<span className={"font-mono font-medium tracking-tight text-gray-600"}>
									•••• {account.last_four_digits}
								</span>
							</div>
						</Dialog.Trigger>
						<Content>
							<div className={"grid grid-cols-1 gap-2 text-center"}>
								<Dialog.Title className={"font-medium text-md"}>
									Lost connection to payment method
								</Dialog.Title>
								<Dialog.Description className={"text-sm text-gray-600"}>
									To reconnect your payment method, you will need to login to your bank institution
									via Plaid.
								</Dialog.Description>
							</div>
							<div className={"grid grid-cols-1 gap-2"}>
								<Dialog.Close asChild>
									<Button size={"sm"} border={theme.colors.gradient.a}>
										<ArrowLeftIcon />
										Return
									</Button>
								</Dialog.Close>
								<Button
									size={"sm"}
									background={theme.colors.gradient.a}
									onClick={() => reauthenticatePlaid(accessToken)}
								>
									<ExitIcon />
									Proceed
								</Button>
							</div>
						</Content>
					</Dialog.Root>,
				);
			} else
				arr.push(
					<div
						className={
							"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
						}
						onClick={() => getTransactions(account.access_token, account.account_id)}
						key={account.item_id}
					>
						<Toggle checked={showAccounts.includes(account.access_token)} />
						{account.name}
						<span className={"font-mono font-medium tracking-tight text-gray-600"}>
							•••• {account.last_four_digits}
						</span>
					</div>,
				);
		}, accounts);

		return arr;
	};

	return (
		<Container className={"bg-black p-3 grid grid-cols-1 gap-4 content-start overflow-auto"}>
			<Script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" />
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
				<Button size={"sm"} style={{ background: theme.colors.gradient.a }} onClick={open}>
					<PlusIcon />
					Add payment account
				</Button>
			</div>
			<div className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-2 text-sm"}>{Account()}</div>
			<div className={"mt-6"}>
				<Header>
					Your <TextGradient gradient={theme.colors.gradient.a}>transactions</TextGradient>
				</Header>
				<div className={"grid grid-cols-1 gap-2"}>
					{!R.isEmpty(transactions) &&
						transactions.map((x: TransactionType) => (
							<Transaction gid={gid} transaction={x} key={x.transaction_id} />
						))}
				</div>
			</div>
			{isLoading && <Loading />}
		</Container>
	);
}
