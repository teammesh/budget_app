import { useRouter } from "next/router";
import { createRef, useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import AddTransactions from "@/components/AddTransactions";
import * as R from "ramda";
import { tempStore, uiStore } from "@/utils/store";
import { verifyUser } from "@/utils/ssr";
import { Button } from "@/components/Button";
import {
	ArrowLeftIcon,
	CheckCircledIcon,
	MixerHorizontalIcon,
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

const mainContentRef = createRef();

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

	useEffect(() => {
		console.log(supabase.getSubscriptions());
	}, [showAddTransactions, showManage, showPayments]);

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
					<Content ref={mainContentRef}>
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
						<GroupFeed groupUsers={groupUsers} activities={activities} />
					</Content>
					<div className={"grid grid-cols-[108px_1fr] gap-2 px-3 pt-3"}>
						<Button
							size={"sm"}
							style={{ background: theme.colors.gradient.a }}
							onClick={() => setShowPayments(true)}
						>
							<CheckCircledIcon /> Pay
						</Button>
						<Button
							size={"sm"}
							background={theme.colors.gradient.a}
							onClick={() => setShowAddTransactions(true)}
						>
							<PlusIcon /> Add transactions
						</Button>
					</div>
				</>
			)}
			{showPayments && <Payments gid={gid} setShowPayments={setShowPayments} balances={balances} />}
			{showManage && <Manage gid={gid} setShowManage={setShowManage} />}
			{showAddTransactions && (
				<AddTransactions gid={gid} setShowAddTransactions={setShowAddTransactions} />
			)}
		</>
	);
};

export async function getServerSideProps({ req, params }: { req: RequestData; params: Params }) {
	const { props, redirect } = await verifyUser(req);
	const { gid } = params;

	const { data: transactions } = await supabase
		.from("shared_transactions")
		.select("*, profiles(username, avatar_url)")
		.eq("group_id", gid);

	const { data: users } = await supabase
		.from("profiles_groups")
		.select(
			"profile_id, amount_paid_transactions, amount_paid_users, split_amount, amount_owed, profiles(username, avatar_url), groups(name)",
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
		.select("id, group_id, user:profile_id(id, username), to_user:to_profile_id(id, username), table_name, table_item_id, type, created_at")
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
