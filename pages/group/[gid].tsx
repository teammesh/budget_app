import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import AddTransactions from "@/components/AddTransactions";
import * as R from "ramda";
import { tempStore, uiStore } from "@/utils/store";
import { verifyUser } from "@/utils/ssr";
import { Button } from "@/components/Button";
import {
	ArrowLeftIcon,
	CheckCircledIcon,
	IdCardIcon,
	MixerHorizontalIcon,
	Pencil2Icon,
	PlusIcon,
} from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import { definitions } from "../../types/supabase";
import { AuthUser } from "@supabase/supabase-js";
import { RequestData } from "next/dist/server/web/types";
import { sortByDate } from "@/utils/helper";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import "swiper/css";
import { GroupFeed, GroupSummary } from "@/components/Group";
import { Content } from "@/components/Main";
import Payments from "@/components/Payments";
import Manage from "@/components/Manage";
import { NextApiResponse } from "next";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalContent } from "@/components/Modal";

const Group = ({
	user,
	profile,
	transactions,
	users,
	balances,
	payments,
	activities,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
	transactions: definitions["shared_transactions"][];
	users: definitions["profiles_groups"][] | any;
	balances: definitions["balances"];
	payments: [] | any;
	activities: [] | any;
}) => {
	const router = useRouter();

	// @ts-ignore
	const { gid }: { gid: string } = router.query;
	const [groupUsers, setGroupUsers] = useState(users);
	const showAddTransactions = uiStore((state) => state.showAddTransactions);
	const showManage = uiStore((state) => state.showManage);
	const showPayments = uiStore((state) => state.showPayments);
	const setShowAddTransactions = uiStore.getState().setShowAddTransactions;
	const setShowPayments = uiStore.getState().setShowPayments;
	const setShowManage = uiStore.getState().setShowManage;
	const setSharedTransactions = tempStore.getState().setSharedTransactions;
	const setFilteredTransactions = tempStore.getState().setFilteredTransactions;
	const setUserPayments = tempStore.getState().setUserPayments;
	const setGroupActivities = tempStore.getState().setGroupActivities;

	useEffect(() => {
		tempStore.getState().setGroupName(users[0].groups.name);
		tempStore.getState().setGroupAvatarUrl(users[0].groups.avatar_url);
		tempStore.getState().setGroupMembers(groupUsers.map((user: any) => user.profiles.username));
		transactions && setSharedTransactions(transactions);
		transactions && setFilteredTransactions(transactions);
		payments && setUserPayments(payments);
		activities && setGroupActivities(activities);

		// subscribe to shared_transactions table based on group_id
		supabase
			.from(`shared_transactions:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchSharedTransactions();
			})
			.subscribe();

		// subscribe to payments changes
		supabase
			.from(`payments:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchUserPayments();
			})
			.subscribe();

		// subscribe to user changes in this group
		supabase
			.from(`profiles_groups:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchGroupUsers();
			})
			.subscribe();

		return () => {
			setSharedTransactions([]);
			setFilteredTransactions([]);
			setUserPayments([]);
			setShowManage(false);
			setShowPayments(false);
			setShowAddTransactions(false);
			supabase.removeAllSubscriptions();
		};
	}, []);

	const fetchGroupUsers = async () => {
		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("profiles_groups")
					.select(
						"profile_id, amount_paid_transactions, split_amount, amount_owed, profiles(username, avatar_url)",
					)
					.eq("group_id", gid),
			true,
		);

		setGroupUsers(data);
	};

	const fetchUserPayments = async () => {
		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("payments")
					.select(
						"id, group_id, amount, from_user:from_profile_id(username, avatar_url), to_user:to_profile_id(username, avatar_url), created_at",
					)
					.eq("group_id", gid),
			true,
		);

		setUserPayments(data);
	};

	const fetchSharedTransactions = async () => {
		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("shared_transactions")
					.select("*, profiles(username, avatar_url)")
					.eq("group_id", gid),
			true,
		);

		setSharedTransactions(data);
		setFilteredTransactions(data);
	};

	return (
		<>
			{!(showPayments || showManage || showAddTransactions) && (
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
								onClick={() => setShowManage(true)}
							>
								<MixerHorizontalIcon />
								Manage
							</Button>
						</div>
						<GroupSummary groupUsers={groupUsers} profile={profile} />
						<GroupFeed groupUsers={groupUsers} />
					</Content>
					<div className={"grid grid-cols-[108px_1fr] gap-2 px-3 pt-3"}>
						<Button
							size={"sm"}
							style={{ background: theme.colors.gradient.a }}
							onClick={() => setShowPayments(true)}
						>
							<CheckCircledIcon /> Pay
						</Button>
						<Dialog.Root>
							<Dialog.Trigger asChild>
								<Button size={"sm"} background={theme.colors.gradient.a}>
									<PlusIcon /> Add transactions
								</Button>
							</Dialog.Trigger>
							<ModalContent>
								<div className={"grid grid-cols-1 gap-2 text-center"}>
									<Dialog.Title className={"font-medium text-md"}>Add transactions</Dialog.Title>
									<Dialog.Description className={"text-sm text-gray-600"}>
										How would you like to enter your transactions?
									</Dialog.Description>
								</div>
								<div className={"grid grid-cols-1 gap-2"}>
									<Dialog.Close asChild>
										<Button size={"sm"} border={theme.colors.gradient.a}>
											<Pencil2Icon />
											Add transactions manually
										</Button>
									</Dialog.Close>
									<Dialog.Close asChild>
										<Button
											size={"sm"}
											background={theme.colors.gradient.a}
											onClick={() => setShowAddTransactions(true)}
										>
											<IdCardIcon />
											Import bank/card transactions
										</Button>
									</Dialog.Close>
								</div>
							</ModalContent>
						</Dialog.Root>
					</div>
				</>
			)}
			{showPayments && <Payments gid={gid} setShowPayments={setShowPayments} balances={balances} />}
			{showManage && <Manage gid={gid} setShowManage={setShowManage} />}
			{showAddTransactions && (
				<AddTransactions
					gid={gid}
					setShowAddTransactions={setShowAddTransactions}
					groupUsers={groupUsers}
				/>
			)}
		</>
	);
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
	const { gid } = params;

	const { data: transactions } = await supabase
		.from("shared_transactions")
		.select("*, profiles(username, avatar_url)")
		.eq("group_id", gid);

	const { data: users } = await supabase
		.from("profiles_groups")
		.select(
			"profile_id, amount_paid_transactions, amount_paid_users, split_amount, amount_owed, profiles(username, avatar_url), groups(name, avatar_url)",
		)
		.eq("group_id", gid);

	const { data: balances } = await supabase
		.from("balances")
		.select(
			"id, group_id, amount, from_profile_id, to_profile_id, from_user:from_profile_id(id, username, avatar_url), to_user:to_profile_id(id, username, avatar_url)",
		)
		.eq("group_id", gid);

	const { data: payments } = await supabase
		.from("payments")
		.select(
			"id, group_id, amount, from_user:from_profile_id(id, username, avatar_url), to_user:to_profile_id(id, username, avatar_url), created_at",
		)
		.eq("group_id", gid);

	const { data: activities } = await supabase
		.from("activities")
		.select(
			"id, group_id, user:profile_id(id, username), to_user:to_profile_id(id, username), table_name, table_item_id, type, created_at",
		)
		.eq("group_id", gid)
		.order("created_at", { ascending: false });

	const sortedTransactions =
		transactions && transactions.length > 0 && R.reverse(sortByDate(transactions));

	return {
		props: { ...props, transactions: sortedTransactions, users, balances, payments, activities },
		redirect,
	};
}

export default Group;
