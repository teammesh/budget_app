import { useRouter } from "next/router";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import {
	ArrowLeftIcon,
	CheckIcon,
	Cross2Icon,
	MixerHorizontalIcon,
	MixIcon,
	Pencil1Icon,
	TrashIcon,
} from "@radix-ui/react-icons";
import { SharedTransaction } from "@/components/SharedTransaction";
import { verifyUser } from "@/utils/ssr";
import { RequestData } from "next/dist/server/web/types";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";
import { Input } from "@/components/Input";
import { definitions } from "../../types/supabase";
import { Slider } from "@/components/Slider";
import { AuthUser } from "@supabase/supabase-js";
import { FormBox, PrimaryBox } from "@/components/boxes";
import { Separator } from "@/components/Separator";
import * as R from "ramda";
import Image from "next/image";
import { motion } from "framer-motion";
import { defaultAnimations } from "@/utils/animation";
import { EDIT_TRANSACTION_AMOUNT_MODE } from "@/constants/components.constants";
import { Content } from "@/components/Main";
import { NextApiResponse } from "next";
import { tempStore } from "@/utils/store";
import create from "zustand";
import Toast from "@/components/Toast";

interface UIStoreState {
	showToast: boolean;
	setShowToast: (x: boolean) => void;
}

const uiStore = create<UIStoreState>((set, get) => ({
	showToast: false,
	setShowToast: (x) => set(() => ({ showToast: x })),
}));

const Transaction = ({
	user,
	profile,
	transaction: oldTransaction,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
	transaction: definitions["shared_transactions"] | any;
}) => {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [transaction, setTransaction] = useState(oldTransaction);
	const groupUsers = transaction.groups.profiles_groups;

	useEffect(() => {
		tempStore.getState().setNewTransaction(transaction);

		return () => {
			tempStore.getState().setNewTransaction({});
		};
	}, []);

	const deleteTransaction = async () => {
		await supabase
			.from("shared_transactions")
			.delete()
			.eq("transaction_id", transaction.transaction_id);
		router.push(`/group/${transaction.groups.id}`);
	};

	const saveTransaction = async () => {
		const req = R.omit(
			["profiles_groups", "groups", "profiles"],
			tempStore.getState().newTransaction,
		);

		const { data, error } = await supabaseQuery(
			() =>
				supabase
					.from("shared_transactions")
					.upsert(req)
					.eq("transaction_id", transaction.transaction_id),
			true,
		);

		if (error) return;
		setTransaction(R.mergeDeepLeft(data[0], transaction));
		setIsEditing(false);
		uiStore.getState().setShowToast(true);
	};

	const cancelChanges = async () => {
		tempStore.getState().setNewTransaction(transaction);
		setIsEditing(false);
	};

	return (
		<>
			<Content>
				<div className={"flex justify-between"}>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={() => router.back()}
					>
						<ArrowLeftIcon />
						Return
					</Button>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={deleteTransaction}
					>
						<TrashIcon />
						Delete
					</Button>
				</div>
				<SharedTransaction transaction={transaction} />
				{isEditing && (
					<FormBox>
						<Field>
							<Label>Transaction name</Label>
							<Input id="transaction-name" type="text" value={transaction.name} />
						</Field>
						<Field>
							<Label>Merchant name</Label>
							<Input id="merchant-name" type="text" value={transaction.merchant_name} />
						</Field>
						<Field>
							<Label>Transaction date</Label>
							<Input id="date" type="date" value={transaction.date} />
						</Field>
					</FormBox>
				)}
				{isEditing && (
					<EditTransactionAmount
						groupUsers={groupUsers}
						profile={profile}
						transaction={transaction}
					/>
				)}
				{!isEditing && (
					<PrimaryBox>
						<div className="flex justify-between">
							<div className="font-medium text-sm">{transaction.location?.city || "City"}</div>
							<div className="font-medium text-sm capitalize">
								{transaction.payment_channel || "N/A"}
							</div>
						</div>
						<div></div>
						<div className="font-mono font-medium text-sm tracking-tight text-gray-600">
							{transaction?.category.map((c: any) => (
								<span key={c} className="mr-4">
									{c}
								</span>
							))}
						</div>
					</PrimaryBox>
				)}
				{!isEditing && (
					<PrimaryBox>
						<div className={"grid grid-cols-1 gap-3"}>
							{groupUsers.map((user: any) => (
								<div
									key={user.profile_id}
									className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}
								>
									<Avatar.Root>
										{user.profiles.avatar_url ? (
											<Image
												src={user.profiles.avatar_url}
												className={"w-6 h-6 rounded-full"}
												height={24}
												width={24}
											/>
										) : (
											<DefaultAvatar
												size={24}
												name={user.profiles.username}
												variant="beam"
												colors={theme.colors.avatar}
											/>
										)}
									</Avatar.Root>
									<div>
										{user.profiles.username} {user.profile_id === profile.id && " (you)"}
									</div>
									<div className={"font-mono font-medium tracking-tighter"}>
										$
										{Number(transaction.split_amounts[user.profile_id]).toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</div>
								</div>
							))}
						</div>
					</PrimaryBox>
				)}
			</Content>
			{isEditing ? (
				<div className={"grid grid-cols-[auto_1fr] gap-2 pt-3 px-3"}>
					<Button size={"sm"} border={theme.colors.gradient.a} onClick={cancelChanges}>
						<Cross2Icon /> Cancel
					</Button>
					<Button size={"sm"} background={theme.colors.gradient.a} onClick={saveTransaction}>
						<CheckIcon /> Save changes
					</Button>
				</div>
			) : (
				<div className={"grid grid-cols-1 pt-3 px-3"}>
					<Button
						size={"sm"}
						background={theme.colors.gradient.a}
						onClick={() => setIsEditing(true)}
					>
						<Pencil1Icon /> Edit transaction
					</Button>
				</div>
			)}
			<SavedSuccessfulToast />
		</>
	);
};

const EditTransactionAmount = ({ transaction, groupUsers, profile }: any) => {
	const newTransaction = tempStore((state) => state.newTransaction);
	const setNewTransaction = tempStore.getState().setNewTransaction;
	const [mode, setMode] = useState<any>(EDIT_TRANSACTION_AMOUNT_MODE.custom);
	const [amountRatios, setAmountRatios] = useState<any>(newTransaction.split_amounts);

	useEffect(() => {
		const totalTransaction = R.values(amountRatios).reduce((prev, curr) => {
			return Number(curr) + prev;
		}, 0);

		setNewTransaction(
			R.assoc("split_amounts", amountRatios, R.assoc("amount", totalTransaction, newTransaction)),
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
					value={newTransaction.amount.toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
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
							<Avatar.Root>
								{user.profiles.avatar_url ? (
									<Image
										src={user.profiles.avatar_url}
										className={"w-6 h-6 rounded-full"}
										height={24}
										width={24}
									/>
								) : (
									<DefaultAvatar
										size={24}
										name={user.profiles.username}
										variant="beam"
										colors={theme.colors.avatar}
									/>
								)}
							</Avatar.Root>
							<div>
								{user.profiles.username} {user.profile_id === profile.id && " (you)"}
							</div>
							<Input
								id={`custom-amount-${user.profile_id}`}
								type="number"
								pattern="\d*"
								value={amountRatios[user.profile_id].toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
								onChange={(e) => {
									// @ts-ignore
									setAmountRatios(R.assocPath([user.profile_id], e.target.value, amountRatios));
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
								<Avatar.Root>
									{user.profiles.avatar_url ? (
										<Image
											src={user.profiles.avatar_url}
											className={"w-6 h-6 rounded-full"}
											height={24}
											width={24}
										/>
									) : (
										<DefaultAvatar
											size={24}
											name={user.profiles.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									)}
								</Avatar.Root>
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
									<div className={"font-mono font-medium tracking-tight text-gray-600"}>
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
											obj[key] =
												(newTransaction.amount * (100 - e[0]) * 0.01) / (groupUsers.length - 1);
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

const SavedSuccessfulToast = () => {
	const showToast = uiStore((state) => state.showToast);
	const setShowToast = uiStore.getState().setShowToast;

	return <Toast open={showToast} setOpen={setShowToast} title={"Transaction saved"} />;
};

export async function getServerSideProps({
	req,
	res,
	params,
}: {
	req: RequestData;
	res: NextApiResponse;
	params: Params;
}) {
	const { props, redirect } = await verifyUser(req, res);
	const { tid } = params;

	const { data } = await supabase
		.from("shared_transactions")
		.select(
			"*, groups(name, id, profiles_groups(*, profiles(id, username, avatar_url))), profiles(username, avatar_url)",
		)
		.eq("id", tid);

	const transaction = data?.at(0);

	return { props: { ...props, transaction }, redirect };
}

export default Transaction;
