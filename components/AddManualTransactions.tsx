import React, { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { tempStore, uiStore } from "@/utils/store";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import {
	ArrowLeftIcon,
	DotFilledIcon,
	MixerHorizontalIcon,
	MixIcon,
	PlusIcon,
} from "@radix-ui/react-icons";
import { Content } from "@/components/Main";
import { useRouter } from "next/router";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";
import { Input } from "@/components/Input";
import { FormBox } from "@/components/boxes";
import { EDIT_TRANSACTION_AMOUNT_MODE } from "@/constants/components.constants";
import * as R from "ramda";
import { Separator } from "@/components/Separator";
import { motion } from "framer-motion";
import { defaultAnimations } from "@/utils/animation";
import { Avatar } from "@/components/Avatar";
import { Slider } from "@/components/Slider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItemIndicator,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/Dropdown";
import { defaultNewTransaction } from "@/pages/group/[gid]";

export default function AddManualTransactions({
	gid,
	groupUsers,
	profile,
}: {
	gid: string;
	setShowAddTransactions: any;
	groupUsers: any;
	profile: any;
}) {
	const router = useRouter();

	useEffect(() => {
		return () => {
			defaultNewTransaction({ gid, groupUsers });
		};
	}, []);

	return (
		<>
			<Content>
				<div className={"flex"}>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={() => router.back()}
					>
						<ArrowLeftIcon />
						Return
					</Button>
				</div>
				<TransactionForm groupUsers={groupUsers} profile={profile} />
			</Content>
			<Toolbar />
		</>
	);
}

// will support adding multiple transactions in the future (CSV or table)
// const TransactionList = () => {
// 	const transactions = useStore((state) => state.transactions);
//
// 	return <TransactionForm transaction={transactions[0]} index={0} />;
// };

export const TransactionForm = ({ groupUsers, profile }: { groupUsers: any; profile: any }) => {
	const newTransaction = tempStore((state) => state.newTransaction);
	const setNewTransaction = tempStore.getState().setNewTransaction;

	const editProperty = (propertyName: string, data: any) => {
		const transaction = { ...newTransaction, [propertyName]: data };

		// @ts-ignore
		setNewTransaction(transaction);
		// useStore.getState().setTransactions([data]);
	};

	return (
		<>
			<FormBox>
				<Field>
					<Label>Transaction name</Label>
					<Input
						id="transaction-name"
						type="text"
						value={newTransaction.name}
						onChange={(e) => editProperty("name", e.target.value)}
					/>
				</Field>
				<Field>
					<Label>Merchant name</Label>
					<Input
						id="merchant-name"
						type="text"
						value={newTransaction.merchant_name}
						onChange={(e) => editProperty("merchant_name", e.target.value)}
					/>
				</Field>
				<Field>
					<Label>Charged to</Label>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Input
								id="charged_to"
								type="text"
								value={
									newTransaction.charged_to
										? groupUsers.find((x: any) => x.profile_id === newTransaction.charged_to)[
												"profiles"
										  ]["username"]
										: ""
								}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent sideOffset={5}>
							<DropdownMenuRadioGroup
								value={newTransaction.charged_to}
								onValueChange={(x) => editProperty("charged_to", x)}
							>
								{groupUsers.map((x: any) => (
									<DropdownMenuRadioItem key={x.profile_id} value={x.profile_id}>
										<DropdownMenuItemIndicator>
											<DotFilledIcon />
										</DropdownMenuItemIndicator>
										{x.profiles.username}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</Field>
				<Field>
					<Label>Transaction date</Label>
					<Input
						id="date"
						type="date"
						value={newTransaction.date}
						onChange={(e) => editProperty("date", e.target.value)}
					/>
				</Field>
			</FormBox>
			<TransactionAmount groupUsers={groupUsers} profile={profile} />
		</>
	);
};

const TransactionAmount = ({ groupUsers, profile }: any) => {
	const newTransaction = tempStore((state) => state.newTransaction);
	const setNewTransaction = tempStore.getState().setNewTransaction;
	const [mode, setMode] = useState<any>(EDIT_TRANSACTION_AMOUNT_MODE.custom);
	const [amountRatios, setAmountRatios] = useState<any>(newTransaction.split_amounts);

	useEffect(() => {
		const totalTransaction = R.values(amountRatios).reduce((prev, curr) => {
			return Number(curr) + prev;
		}, 0);

		setNewTransaction(
			R.assoc(
				"split_amounts",
				amountRatios,
				R.assoc("amount", totalTransaction.toFixed(2), newTransaction),
			),
		);
	}, [amountRatios]);

	return (
		<FormBox>
			<Field>
				<Label>Transaction amount</Label>
				<Input
					id="amount"
					type="number"
					pattern="\d*"
					disabled={mode === EDIT_TRANSACTION_AMOUNT_MODE.custom}
					value={newTransaction.amount}
					onChange={(e) => {
						const tmp = amountRatios;
						groupUsers.map((x: any) => {
							tmp[x.profile_id] =
								Number(e.target.value) * (amountRatios[x.profile_id] / newTransaction.amount);
						});

						setNewTransaction(
							R.assoc(
								"split_amounts",
								tmp,
								R.assoc("amount", Number(e.target.value), newTransaction),
							),
						);
					}}
				/>
			</Field>
			<Separator />
			<div className={"grid grid-cols-2"}>
				<div
					className={
						"bg-gray-800 p-3 rounded-bl-md rounded-tl-md grid grid-cols-[auto_auto] gap-1 justify-center items-center font-mono text-sm tracking-tighter leading-none"
					}
					style={{
						background:
							mode === EDIT_TRANSACTION_AMOUNT_MODE.custom
								? theme.colors.gradient.a
								: theme.colors.gray[800],
					}}
					onClick={() => setMode(EDIT_TRANSACTION_AMOUNT_MODE.custom)}
				>
					<MixIcon />
					Custom
				</div>
				<div
					className={
						"bg-gray-800 p-3 rounded-br-md rounded-tr-md grid grid-cols-[auto_auto] gap-1 justify-center items-center font-mono text-sm tracking-tighter leading-none"
					}
					style={{
						background:
							mode === EDIT_TRANSACTION_AMOUNT_MODE.slider
								? theme.colors.gradient.a
								: theme.colors.gray[800],
					}}
					onClick={() => setMode(EDIT_TRANSACTION_AMOUNT_MODE.slider)}
				>
					<MixerHorizontalIcon /> Slider
				</div>
			</div>
			{mode === EDIT_TRANSACTION_AMOUNT_MODE.custom && (
				<motion.div className={"grid grid-cols-1 gap-3"} {...defaultAnimations}>
					{groupUsers.map((user: any) => (
						<div
							key={user.profile_id}
							className={"grid grid-cols-[auto_1fr_80px] items-center text-sm gap-3"}
						>
							<Avatar
								avatarUrl={user.profiles.avatar_url}
								avatarName={user.profiles.username}
								size={24}
							/>
							<div>
								{user.profiles.username} {user.profile_id === profile.id && " (you)"}
							</div>
							<Input
								id={`custom-amount-${user.profile_id}`}
								type="number"
								pattern="\d*"
								value={amountRatios[user.profile_id]}
								onChange={(e) => {
									// @ts-ignore
									setAmountRatios(
										R.assocPath([user.profile_id.toString()], Number(e.target.value), amountRatios),
									);
								}}
							/>
						</div>
					))}
				</motion.div>
			)}
			{mode === EDIT_TRANSACTION_AMOUNT_MODE.slider && (
				<motion.div className={"grid grid-cols-1 gap-3"} {...defaultAnimations}>
					{groupUsers.map((user: any) => (
						<div className={"grid grid-cols-1 gap-2"} key={user.profile_id}>
							<div className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}>
								<Avatar
									avatarUrl={user.profiles.avatar_url}
									avatarName={user.profiles.username}
									size={24}
								/>
								<div>
									{user.profiles.username} {user.profile_id === profile.id && " (you)"}
								</div>
								<div className={"grid grid-cols-[auto_auto_auto] gap-1"}>
									<div className={"font-mono font-medium tracking-tight"}>
										$
										{amountRatios[user.profile_id].toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</div>
									<div className={"font-mono font-medium tracking-tight"}>/</div>
									<div className={"font-mono font-medium tracking-tight text-gray-500"}>
										%{Math.round((amountRatios[user.profile_id] / newTransaction.amount) * 100)}
									</div>
								</div>
							</div>
							<Slider
								onValueChange={(e: number[]) => {
									// @ts-ignore
									const amtRatios = R.clone(amountRatios);
									R.forEachObjIndexed((x, key, obj: any) => {
										if (key === user.profile_id) obj[key] = newTransaction.amount * e[0] * 0.01;
										else
											obj[key] = Number(
												(
													(newTransaction.amount * (100 - e[0]) * 0.01) /
													(groupUsers.length - 1)
												).toFixed(2),
											);
									}, amtRatios);

									// @ts-ignore
									setAmountRatios(amtRatios);
								}}
								value={[Math.round((amountRatios[user.profile_id] / newTransaction.amount) * 100)]}
							/>
						</div>
					))}
				</motion.div>
			)}
		</FormBox>
	);
};

const Toolbar = () => {
	const newTransaction = tempStore((state) => state.newTransaction);

	const submit = async () => {
		uiStore.getState().setGlobalLoading(true);
		const { data, error } = await supabaseQuery(
			() => supabase.from("shared_transactions").insert(newTransaction),
			true,
		);

		uiStore.getState().setGlobalLoading(false);
		if (!error) uiStore.getState().setShowAddTransactionSuccess(true);
		uiStore.getState().setShowAddManualTransactions(false);
	};

	return (
		<div className={"grid grid-cols-[1fr] justify-center gap-8 pt-3 px-3"}>
			<Button
				size={"sm"}
				background={theme.colors.gradient.a}
				disabled={
					!(
						newTransaction.amount &&
						newTransaction.charged_to &&
						newTransaction.name &&
						newTransaction.date &&
						newTransaction.merchant_name
					)
				}
				onClick={submit}
			>
				<PlusIcon /> Submit transaction
			</Button>
		</div>
	);
};
