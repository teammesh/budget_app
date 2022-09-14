import React, { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { sessionStore, tempStore, uiStore } from "@/utils/store";
import * as R from "ramda";
import { assocPath } from "ramda";
import { Transaction as TransactionType } from "plaid";
import { plaidLink, plaidLinkUpdate } from "@/components/plaidLink";
import { sortByDate } from "@/utils/helper";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon, ExclamationTriangleIcon, ExitIcon, PlusIcon } from "@radix-ui/react-icons";
import Toggle from "@/components/Toggle";
import { Transaction } from "@/components/Transaction";
import { Header, TextGradient } from "@/components/text";
import { Loading } from "@/components/Loading";
import Script from "next/script";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalContent } from "./Modal";
import { displayAmount } from "./Amount";
import { Content } from "@/components/Main";
import { definitions } from "../types/supabase";
import { TRANSACTION_METADATA } from "@/constants/components.constants";
import { StoreType } from "../types/store";

export default function AddTransactions({
	gid,
	setShowAddTransactions,
	groupUsers,
}: {
	gid: string;
	setShowAddTransactions: any;
	groupUsers: any;
}) {
	const profile_id = supabase.auth.session()?.user?.id;
	const [showAccounts, setShowAccounts] = useState<definitions["plaid_items"]["account_id"][]>([]);
	const [isLoading, setIsLoading] = useState<any>(true);
	const userTransactions = sessionStore((state) => state.userTransactions);
	const setUserTransactions = sessionStore.getState().setUserTransactions;
	const accounts = tempStore((state) => state.accounts);
	const setAccounts = tempStore.getState().setAccounts;
	const setAddTransactions = tempStore.getState().setAddTransactions;
	const setAccountPagination = sessionStore.getState().setAccountPagination;

	useEffect(() => {
		supabase
			.from<definitions["plaid_items"]>("plaid_items")
			.select()
			.eq("profile_id", profile_id)
			.then(async ({ data, error }) => {
				if (data && !R.isEmpty(data)) {
					setAccounts(R.indexBy(R.prop("account_id"), data));

					// fetch transactions for the first pm and display them
					await getTransactions(
						data[0].access_token,
						data[0].account_id,
						sessionStore.getState().accountPagination[data[0].account_id] &&
							sessionStore.getState().accountPagination[data[0].account_id]["cursor"],
					);
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

		return () => {
			setAddTransactions([]);
		};
	}, []);

	const getTransactions = async (
		access_token: definitions["plaid_items"]["access_token"],
		account_id: definitions["plaid_items"]["account_id"],
		cursor: StoreType["accountPagination"]["cursor"],
	) => {
		setIsLoading(true);

		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(account_id)) {
			setShowAccounts(R.without([account_id], showAccounts));
			return setIsLoading(false);
		}

		let allTransactions = sessionStore.getState().userTransactions;

		// Check Plaid for any new/modified/removed transactions using transaction cursor
		const plaidTransactions: {
			added: TransactionType[];
			removed: TransactionType[];
			modified: TransactionType[];
			error?: any;
			next_cursor: string;
		} = await fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				cursor,
			}),
		}).then((res) => res.json());

		// remove from showAccounts and flag the pm for re-authentication
		if (plaidTransactions?.error?.error_code === "ITEM_LOGIN_REQUIRED") {
			setAccounts(assocPath([account_id, "invalid"], true, accounts));
			setShowAccounts(R.without([account_id], showAccounts));
			return setIsLoading(false);
		}

		/*
			If there are modified/removed transactions...
			then we need to update the locally stored transactions with these changes
		*/
		if (!R.isEmpty(plaidTransactions.modified)) {
			const modifiedPlaidTransactions = R.indexBy(
				R.prop("transaction_id"),
				R.map<any, any>(
					(x) => R.assocPath(["profile_id"], profile_id || null, R.pick(TRANSACTION_METADATA, x)),
					R.filter((x) => !x.pending, plaidTransactions.modified),
				),
			);
			allTransactions = R.mergeDeepLeft(modifiedPlaidTransactions, allTransactions);
		}
		if (!R.isEmpty(plaidTransactions.removed)) {
			const removedPlaidTransactions = R.pluck("transaction_id", plaidTransactions.removed);
			allTransactions = R.omit(removedPlaidTransactions, allTransactions);
		}

		/*
			If there are new transactions...
			then we need to insert it to userTransactions and re-sort
		*/
		if (!R.isEmpty(plaidTransactions.added)) {
			const newPlaidTransactions = R.map(
				(x) => R.assocPath(["profile_id"], profile_id || null, R.pick(TRANSACTION_METADATA, x)),
				R.filter((x) => !x.pending, plaidTransactions.added),
			);
			const mergeTransactions = R.concat(R.values(allTransactions), newPlaidTransactions);
			console.log(mergeTransactions);
			const sortTransactions = R.reverse(sortByDate(mergeTransactions));
			allTransactions = R.indexBy(R.prop("transaction_id"), sortTransactions);
		}

		setUserTransactions(allTransactions);
		setAccountPagination(
			R.assocPath(
				[account_id, "cursor"],
				plaidTransactions.next_cursor,
				sessionStore.getState().accountPagination,
			),
		);
		setShowAccounts(R.append(account_id, showAccounts));

		console.log(plaidTransactions);
		console.log(sessionStore.getState().userTransactions);
		return setIsLoading(false);
	};

	const reauthenticatePlaid = (
		access_token: definitions["plaid_items"]["access_token"],
		account_id: definitions["plaid_items"]["account_id"],
	) => {
		setIsLoading(true);
		fetch("/api/plaidCreateLinkToken", {
			method: "post",
			body: JSON.stringify({
				profile_id: supabase.auth.session()?.user?.id,
				access_token,
			}),
		}).then((res) =>
			res.json().then((token) => {
				return window.Plaid.create(
					plaidLinkUpdate({ setIsLoading, linkToken: token, account_id }),
				).open();
			}),
		);
	};

	const Account = () => {
		const arr: any[] = [];

		R.forEachObjIndexed((account, itemId) => {
			if (account.invalid) {
				arr.push(
					<Dialog.Root key={account.account_id}>
						<Dialog.Trigger asChild>
							<div
								className={
									"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
								}
								key={account.account_id}
							>
								<Toggle checked={showAccounts.includes(account.account_id)} />
								<div
									className={
										"grid grid-cols-[auto_auto] gap-2 items-center place-content-start text-ellipsis overflow-hidden whitespace-nowrap"
									}
								>
									{<ExclamationTriangleIcon color={theme.colors.avatar[0]} />}
									{account.name}
								</div>
								<span className={"font-mono font-medium tracking-tight text-gray-500"}>
									•••• {account.last_four_digits}
								</span>
							</div>
						</Dialog.Trigger>
						<ModalContent>
							<div className={"grid grid-cols-1 gap-2 text-center"}>
								<Dialog.Title className={"font-medium text-md"}>
									Lost connection to payment method
								</Dialog.Title>
								<Dialog.Description className={"text-sm text-gray-500"}>
									To reconnect your payment method, you will need to login to your bank institution
									via Plaid.
								</Dialog.Description>
							</div>
							<div className={"grid grid-cols-1 gap-2"}>
								<Dialog.Close asChild>
									<Button size={"sm"} border={theme.colors.gradient.a}>
										<ArrowLeftIcon />
										Cancel
									</Button>
								</Dialog.Close>
								<Button
									size={"sm"}
									background={theme.colors.gradient.a}
									onClick={() => reauthenticatePlaid(account.access_token, account.account_id)}
								>
									<ExitIcon />
									Proceed
								</Button>
							</div>
						</ModalContent>
					</Dialog.Root>,
				);
			} else
				arr.push(
					<div
						className={
							"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
						}
						onClick={() =>
							getTransactions(
								account.access_token,
								account.account_id,
								sessionStore.getState().accountPagination[account.account_id]["cursor"],
							)
						}
						key={account.account_id}
					>
						<Toggle checked={showAccounts.includes(account.account_id)} />
						<div className={"text-ellipsis overflow-hidden whitespace-nowrap"}>{account.name}</div>
						<span className={"font-mono font-medium tracking-tight text-gray-500"}>
							•••• {account.last_four_digits}
						</span>
					</div>,
				);
		}, accounts);

		return arr;
	};

	return (
		<>
			<Content>
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
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={() => window.Plaid.create(plaidLink({ setIsLoading })).open()}
					>
						<PlusIcon />
						Add payment account
					</Button>
				</div>
				<div className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-2 text-sm"}>
					{Account()}
				</div>
				<div className={"mt-6"}>
					<Header>
						Your <TextGradient gradient={theme.colors.gradient.a}>transactions</TextGradient>
					</Header>
					<div className={"grid grid-cols-1 gap-2"}>
						{!R.isEmpty(userTransactions) &&
							R.values(userTransactions).map(
								(x) =>
									showAccounts.includes(x.account_id) && (
										<Transaction gid={gid} transaction={x} key={x.id} groupUsers={groupUsers} />
									),
							)}
					</div>
				</div>
				{isLoading && <Loading />}
			</Content>
			<Toolbar />
		</>
	);
}

const Toolbar = () => {
	const addTransactions = tempStore((state) => state.addTransactions);

	const onAddTransactions = async () => {
		const addTransactions = tempStore.getState().addTransactions;

		if (addTransactions.length === 0) return;

		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("shared_transactions")
					.upsert(tempStore.getState().addTransactions)
					.select("*, profiles(username, avatar_url)"),
			true,
		);

		const indexedData: Record<string, definitions["shared_transactions"]> = R.indexBy(
			R.prop("id"),
			data,
		);
		tempStore.getState().updateSharedTransactions(indexedData);
		uiStore.getState().setShowAddTransactions(false);
		tempStore.getState().setAddTransactions([]);
	};

	return (
		<div className={"grid grid-cols-[auto_1fr] justify-center gap-8 pt-3 px-3"}>
			<div className={"grid grid-cols-1 gap-1"}>
				<div className={"font-mono tracking-tighter text-sm"}>Total transaction:</div>
				<div className={"text-xl tracking-tight leading-none"}>
					{addTransactions.length === 0
						? "--"
						: displayAmount(
								addTransactions.reduce((prev, curr) => {
									if (!curr.amount) return prev;
									return curr.amount + prev;
								}, 0),
						  )}
				</div>
			</div>
			<Button size={"sm"} background={theme.colors.gradient.a} onClick={onAddTransactions}>
				<PlusIcon /> Add {addTransactions.length} transactions
			</Button>
		</div>
	);
};
