import React, { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { tempStore, uiStore } from "@/utils/store";
import * as R from "ramda";
import { assocPath } from "ramda";
import { TransactionsGetResponse } from "plaid";
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
import {
	TRANSACTION_METADATA,
	TRANSACTION_PAGINATION_COUNT,
} from "@/constants/components.constants";
import { AccountType } from "../types/store";

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
	const userTransactions = tempStore((state) => state.userTransactions);
	const setUserTransactions = tempStore.getState().setUserTransactions;
	const updateTransactionPagination = tempStore.getState().updateTransactionPagination;
	const accounts = tempStore((state) => state.accounts);
	const setAccounts = tempStore.getState().setAccounts;
	const setAddTransactions = tempStore.getState().setAddTransactions;

	useEffect(() => {
		supabase
			.from<definitions["plaid_items"]>("plaid_items")
			.select()
			.eq("profile_id", profile_id)
			.then(async ({ data, error }) => {
				if (data && !R.isEmpty(data)) {
					setAccounts(R.indexBy(R.prop("account_id"), data));

					// fetch transactions for the first pm and display them
					await getTransactions(data[0].access_token, data[0].account_id);
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

		document
			.querySelector("#transactions")
			?.addEventListener("scroll", (evt) => getTransactionsOnScrollEnd(evt));

		return () => {
			setAddTransactions([]);
			document
				.querySelector("#transactions")
				?.removeEventListener("scroll", (evt) => getTransactionsOnScrollEnd(evt));
		};
	}, []);

	const getTransactions = async (
		access_token: definitions["plaid_items"]["access_token"],
		account_id: definitions["plaid_items"]["account_id"],
	) => {
		// hide transactions for the pm if it is toggled again
		if (showAccounts.includes(account_id)) {
			setShowAccounts(R.without([account_id], showAccounts));
			return setIsLoading(false);
		} else if (tempStore.getState().transactionPagination.hasOwnProperty(account_id)) {
			return setShowAccounts(R.append(account_id, showAccounts));
		}

		const pagination = tempStore.getState().transactionPagination[account_id] || {
			start_date: paginateDate(getFormattedDate(new Date())),
			end_date: getFormattedDate(new Date()),
			offset: 0,
		};
		if (pagination?.reached_limit) return;

		let allTransactions = tempStore.getState().userTransactions;
		setIsLoading(true);

		// Check Plaid for any new/modified/removed transactions using transaction cursor
		const { start_date, end_date, offset } = pagination;
		const plaidTransactions: TransactionsGetResponse = await fetch("/api/plaidGetTransactions", {
			method: "post",
			body: JSON.stringify({
				access_token,
				start_date,
				end_date,
				offset,
				count: TRANSACTION_PAGINATION_COUNT,
			}),
		}).then((res) => res.json());

		// remove from showAccounts and flag the pm for re-authentication
		if (plaidTransactions?.error?.error_code === "ITEM_LOGIN_REQUIRED") {
			setAccounts(assocPath([account_id, "invalid"], true, accounts));
			setShowAccounts(R.without([account_id], showAccounts));
			return setIsLoading(false);
		}

		// increment offset/date
		if (plaidTransactions.total_transactions === 0) {
			updateTransactionPagination({
				[account_id]: { start_date, end_date, offset, reached_limit: true },
			});
		} else if (
			plaidTransactions.total_transactions > offset &&
			plaidTransactions.total_transactions > TRANSACTION_PAGINATION_COUNT
		) {
			updateTransactionPagination({
				[account_id]: { start_date, end_date, offset: offset + TRANSACTION_PAGINATION_COUNT },
			});
		} else {
			updateTransactionPagination({
				[account_id]: {
					start_date: paginateDate(start_date),
					end_date: paginateDate(end_date),
					offset: 0,
				},
			});
		}

		/*
			If there are new transactions...
			then we need to insert it to userTransactions and re-sort
		*/
		if (!R.isEmpty(plaidTransactions.transactions)) {
			const newPlaidTransactions = R.map(
				(x) => R.assocPath(["profile_id"], profile_id || null, R.pick(TRANSACTION_METADATA, x)),
				plaidTransactions.transactions,
			);
			const mergeTransactions = R.concat(R.values(allTransactions), newPlaidTransactions);
			const sortTransactions = R.reverse(sortByDate(mergeTransactions));
			allTransactions = R.indexBy(R.prop("transaction_id"), sortTransactions);
		}

		setUserTransactions(allTransactions);
		setShowAccounts(R.append(account_id, showAccounts));

		// console.log(plaidTransactions);
		// console.log(tempStore.getState().userTransactions);
		// console.log(tempStore.getState().transactionPagination);
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

	const getTransactionsOnScrollEnd = (evt: Event) => {
		const el = evt.target as HTMLDivElement;
		if (R.isNil(el)) return;

		if (el.scrollTop + el.clientHeight === el.scrollHeight) {
			// User has scrolled to the bottom of the element
			const accounts = tempStore.getState().accounts;
			return getTransactions(R.values(accounts)[0].access_token, R.values(accounts)[0].account_id);
		}
	};

	const paginateDate = (date: string) => {
		const newDate = new Date(date.replaceAll("-", "/"));
		const month = newDate.getMonth() - 6;
		if (month < 0) {
			newDate.setFullYear(newDate.getFullYear() - 1);
			newDate.setMonth(11 - Math.abs(month));
		} else newDate.setMonth(month);
		newDate.setHours(0, 0, 0, 0);
		return getFormattedDate(newDate);
	};

	const getFormattedDate = (date: Date) => {
		return date
			.toLocaleDateString("en-ZA", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.replaceAll("/", "-");
	};

	const Account = (account: AccountType) => {
		if (account.invalid) {
			return (
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
				</Dialog.Root>
			);
		} else
			return (
				<div
					className={
						"grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1"
					}
					onClick={() => getTransactions(account.access_token, account.account_id)}
					key={account.account_id}
				>
					<Toggle checked={showAccounts.includes(account.account_id)} />
					<div className={"text-ellipsis overflow-hidden whitespace-nowrap"}>{account.name}</div>
					<span className={"font-mono font-medium tracking-tight text-gray-500"}>
						•••• {account.last_four_digits}
					</span>
				</div>
			);
	};

	return (
		<>
			<Content id={"transactions"}>
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
					{R.values(accounts).map((account) => Account(account))}
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
