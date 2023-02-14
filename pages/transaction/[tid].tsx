import { useRouter } from "next/router";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import {
	ArrowLeftIcon,
	CheckIcon,
	Cross2Icon,
	Pencil1Icon,
	TrashIcon,
} from "@radix-ui/react-icons";
import { SharedTransaction } from "@/components/SharedTransaction";
import { verifyUser } from "@/utils/ssr";
import { RequestData } from "next/dist/server/web/types";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useEffect, useState } from "react";
import { definitions } from "../../types/supabase";
import { AuthUser } from "@supabase/supabase-js";
import { PrimaryBox } from "@/components/boxes";
import * as R from "ramda";
import { Content } from "@/components/Main";
import { NextApiResponse } from "next";
import { tempStore } from "@/utils/store";
import create from "zustand";
import Toast from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { TransactionForm } from "@/components/AddManualTransactions";
import { TransactionType } from "../../types/store";

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
	transaction: TransactionType;
}) => {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [transaction, setTransaction] = useState<TransactionType>(oldTransaction);
	// @ts-ignore
	const groupUsers = R.indexBy(R.prop("profile_id"), transaction.groups.profiles_groups);

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
				{isEditing && <TransactionForm profile={profile} groupUsers={groupUsers} />}
				{!isEditing && (
					<PrimaryBox>
						<div className="flex justify-between">
							<div className="font-medium text-sm">{transaction.location?.city || "City"}</div>
							<div className="font-medium text-sm capitalize">
								{transaction.payment_channel || "N/A"}
							</div>
						</div>
						<div></div>
						<div className="font-mono font-medium text-sm tracking-tight text-gray-500">
							{transaction?.category?.map((c: any) => (
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
							{R.values(groupUsers).map((user: any) => (
								<div
									key={user.profile_id}
									className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}
								>
									<Avatar
										avatarUrl={user.profiles.avatar_url}
										avatarName={user.profiles.username}
										size={24}
									/>
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
				{!isEditing && (
					<PrimaryBox>
						<div className="flex justify-between">
							<div className="font-medium text-sm">Notes</div>
						</div>
						<div className="font-mono font-medium text-sm tracking-tight text-gray-500">
							{transaction?.notes || "Edit transaction to add notes"}
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
