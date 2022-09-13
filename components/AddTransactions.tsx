import React, { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { sessionStore, tempStore, uiStore } from "@/utils/store";
import * as R from "ramda";
import { assocPath } from "ramda";
import { Transaction as TransactionType } from "plaid";
import { ItemPublicTokenExchangeResponse } from "plaid/api";
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
	const [showAccounts, setShowAccounts] = useState<any>([]);
	const [transactions, setTransactions] = useState<
		Record<string, definitions["profiles_transactions"]>
	>({});
	const [isLoading, setIsLoading] = useState<any>(true);
	const accounts = sessionStore((state) => state.accounts);
	const setAccounts = sessionStore.getState().setAccounts;
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
					await getTransactions(data[0].access_token, data[0].account_id, data[0].cursor);

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

		return () => {
			setAddTransactions([]);
		};
	}, []);

	const getTransactions = async (
		access_token: ItemPublicTokenExchangeResponse["access_token"],
		account_id: TransactionType["account_id"],
		cursor: string | null,
	) => {
		setIsLoading(true);
		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(access_token)) {
			setShowAccounts(R.without([access_token], showAccounts));
			setTransactions(
				R.pickBy(
					(value: definitions["profiles_transactions"], key) => value.account_id !== account_id,
					transactions,
				),
			);
			return setIsLoading(false);
		}

		const { data: userTransactions } = await supabase
			.from<definitions["profiles_transactions"]>("profiles_transactions")
			.select("*")
			.eq("profile_id", profile_id)
			.not("transaction_id", "is", null)
			.limit(100);

		const plaidTransactions: {
			added: TransactionType[];
			removed: TransactionType[];
			modified: TransactionType[];
			error?: any;
		} = await fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				cursor,
			}),
		}).then((res) => res.json());

		// if (userTransactions) {
		// 	tempStore.getState().updateUserTransactions(userTransactions);
		// }

		// remove from showAccounts and flag the pm for re-authentication
		if (plaidTransactions?.error?.error_code === "ITEM_LOGIN_REQUIRED") {
			setAccounts(assocPath([access_token, "invalid"], true, sessionStore.getState().accounts));
			setShowAccounts(R.without([access_token], showAccounts));
			setIsLoading(false);
			return;
		}

		const newPlaidTransactions = R.map(
			(x) => R.assocPath(["profile_id"], profile_id || null, R.pick(TRANSACTION_METADATA, x)),
			R.filter((x) => !x.pending, plaidTransactions.added),
		);
		const modifiedPlaidTransactions = R.map(
			(x) => R.assocPath(["profile_id"], profile_id || null, R.pick(TRANSACTION_METADATA, x)),
			R.filter((x) => !x.pending, plaidTransactions.modified),
		);
		const removedPlaidTransactions = R.pluck("transaction_id", plaidTransactions.removed);
		const userPlaidTransactions = R.isEmpty(userTransactions)
			? {} // @ts-ignore
			: R.omit(removedPlaidTransactions, R.indexBy(R.prop("transaction_id"), userTransactions));
		const allTransactions = R.concat(
			newPlaidTransactions,
			R.concat(R.values(userPlaidTransactions), modifiedPlaidTransactions),
		);
		const sortedTransactions = R.reverse(sortByDate(allTransactions));
		const indexedTransactions = R.indexBy(R.prop("transaction_id"), sortedTransactions);

		// add new Plaid transactions to db
		!R.isEmpty(newPlaidTransactions) &&
			(await supabase
				.from("profiles_transactions")
				.upsert(newPlaidTransactions, { returning: "minimal" }));
		// remove any removed transactions from db
		!R.isEmpty(removedPlaidTransactions) &&
			(await supabase
				.from("profiles_transactions")
				.delete({ returning: "minimal" })
				.eq("profile_id", profile_id)
				.contains("transaction_id", removedPlaidTransactions));
		// update any modified transactions to db
		!R.isEmpty(modifiedPlaidTransactions) &&
			(await supabase
				.from("profiles_transactions")
				.upsert(modifiedPlaidTransactions, { returning: "minimal" })
				.eq("profile_id", profile_id));

		setTransactions(indexedTransactions);
		setShowAccounts([...showAccounts, access_token]);

		console.log(plaidTransactions);
		console.log(indexedTransactions);
		return setIsLoading(false);
	};

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
					<Dialog.Root key={account.item_id}>
						<Dialog.Trigger asChild>
							<div
								className={
									"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
								}
								key={account.item_id}
							>
								<Toggle checked={showAccounts.includes(account.access_token)} />
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
									onClick={() => reauthenticatePlaid(accessToken)}
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
							getTransactions(account.access_token, account.account_id, account.cursor)
						}
						key={account.item_id}
					>
						<Toggle checked={showAccounts.includes(account.access_token)} />
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
						{!R.isEmpty(transactions) &&
							R.values(transactions).map((x: definitions["profiles_transactions"]) => (
								<Transaction gid={gid} transaction={x} key={x.id} groupUsers={groupUsers} />
							))}
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
