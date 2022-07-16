import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import AddTransactions from "@/components/AddTransactions";
import * as R from "ramda";
import { isEmpty } from "ramda";
import { tempStore, uiStore } from "@/utils/store";
import Link from "next/link";
import { verifyUser } from "@/utils/ssr";
import { Button } from "@/components/Button";
import {
	ArrowLeftIcon,
	CheckCircledIcon,
	MixerHorizontalIcon,
	PlusIcon,
} from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import * as Avatar from "@radix-ui/react-avatar";
import { ArrowBetweenIcon, BarChartIcon, PieChartIcon } from "@/components/icons";
import { Separator } from "@/components/Separator";
import { Header, PaginatedHeader, TextGradient } from "@/components/text";
import { displayAmount } from "@/components/Amount";
import { definitions } from "../../types/supabase";
import { AuthUser } from "@supabase/supabase-js";
import { RequestData } from "next/dist/server/web/types";
import Payments from "@/components/Payments";
import DefaultAvatar from "boring-avatars";
import Manage from "@/components/Manage";
import { SharedTransaction } from "@/components/SharedTransaction";
import Image from "next/image";
import { sortByDate } from "@/utils/helper";
import { Payment } from "@/components/Payment";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { styled } from "@stitches/react";

const Group = ({
	user,
	profile,
	transactions,
	users,
	balances,
	payments,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
	transactions: definitions["shared_transactions"][];
	users: definitions["profiles_groups"][] | any;
	balances: definitions["balances"];
	payments: [] | any;
}) => {
	const router = useRouter();
	// @ts-ignore
	const { gid }: { gid: string } = router.query;
	const showAddTransactions = uiStore((state) => state.showAddTransactions);
	const setShowAddTransactions = uiStore.getState().setShowAddTransactions;
	const showPayments = uiStore((state) => state.showPayments);
	const setShowPayments = uiStore.getState().setShowPayments;
	const showManage = uiStore((state) => state.showManage);
	const setShowManage = uiStore.getState().setShowManage;

	const [groupUsers, setGroupUsers] = useState(users);
	const setSharedTransactions = tempStore.getState().setSharedTransactions;
	const filteredTransactions = tempStore((state) => state.filteredTransactions);
	const setFilteredTransactions = tempStore.getState().setFilteredTransactions;
	const userPayments = tempStore((state) => state.userPayments);
	const setUserPayments = tempStore.getState().setUserPayments;

	useEffect(() => {
		tempStore.getState().setGroupName(users[0].groups.name);
		tempStore.getState().setGroupMembers(groupUsers.map((user: any) => user.profiles.username));
		transactions && setSharedTransactions(transactions);
		transactions && setFilteredTransactions(transactions);
		payments && setUserPayments(payments);
		return () => {
			setSharedTransactions([]);
			setFilteredTransactions([]);
			setUserPayments([]);
			supabase.removeAllSubscriptions();
		};
	}, []);

	useEffect(() => {
		uiStore.getState().setToolbar(toolbar);
	}, [showPayments, showManage, showAddTransactions]);

	useEffect(() => {
		if (!gid) return;

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
	}, [gid]);

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

		setSharedTransactions(data);
		setFilteredTransactions(data);
	};

	const fetchUserPayments = async () => {
		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("payments")
					.select(
						"id, group_id, amount, from_user:from_profile_id(username, avatar_url), to_user:to_profile_id(username, avatar_url)",
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

		setGroupUsers(data);
	};

	const toolbar = () => (
		<div className={"grid grid-cols-[108px_1fr] gap-2"}>
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
	);

	const PaginatedHeaderCont = styled("div", {
		"-ms-overflow-style": "none",
		scrollbarWidth: "none",

		"&::-webkit-scrollbar": {
			display: "none",
		},
	});

	return (
		<div className={"grid grid-cols-1 gap-4"}>
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
			<div className={"mt-6"}>
				<PaginatedHeaderCont
					className={
						"grid grid-cols-[auto_auto_auto] gap-2 overflow-x-auto mb-4 pl-3 pr-40 pb-2 scroll"
					}
				>
					<PaginatedHeader active={true}>Activity</PaginatedHeader>
					<PaginatedHeader>Payments</PaginatedHeader>
					<PaginatedHeader>Transactions</PaginatedHeader>
				</PaginatedHeaderCont>
				<div className={"grid grid-cols-1 gap-2"}>
					{!isEmpty(filteredTransactions) &&
						filteredTransactions.map((x) => (
							<Link href={`/transaction/${encodeURIComponent(x.id)}`} key={x.id} passHref>
								<SharedTransaction transaction={x} groupUsers={groupUsers} />
							</Link>
						))}
				</div>
			</div>
			<div className={"mt-6"}>
				<Header>
					User <TextGradient gradient={theme.colors.gradient.a}>payments</TextGradient>
				</Header>
				<div className={"grid grid-cols-1 gap-2"}>
					{!isEmpty(userPayments) &&
						userPayments.map((x) => (
							<div key={x.id}>
								<Payment
									profile_id={profile.id}
									from_user={x.from_user}
									to_user={x.to_user}
									amount={x.amount}
									paid={true}
								/>
							</div>
						))}
				</div>
			</div>
			{showAddTransactions && (
				<AddTransactions gid={gid} setShowAddTransactions={setShowAddTransactions} />
			)}
			{showPayments && <Payments gid={gid} setShowPayments={setShowPayments} balances={balances} />}
			{showManage && <Manage gid={gid} setShowManage={setShowManage} />}
		</div>
	);
};

const GroupSummary = ({
	groupUsers,
	profile,
}: {
	groupUsers: definitions["profiles_groups"][] | any;
	profile: definitions["profiles"];
}) => {
	const [showRunningTotal, setShowRunningTotal] = useState(false);
	const groupName = tempStore.getState().groupName;
	const sharedTransactions = tempStore.getState().sharedTransactions;
	const setFilteredTransactions = tempStore.getState().setFilteredTransactions;

	const filterTransactionsByUser = (profileId: string) => {
		setFilteredTransactions(sharedTransactions.filter((x) => x.charged_to === profileId));
	};

	return (
		<div
			className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-4 items-center cursor-pointer"}
		>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-3 items-center"}>
				<div onClick={() => setFilteredTransactions(sharedTransactions)}>
					<Avatar.Root>
						<Avatar.Fallback>
							<DefaultAvatar
								size={32}
								name={groupName}
								variant="marble"
								colors={theme.colors.avatar}
							/>
						</Avatar.Fallback>
					</Avatar.Root>
				</div>
				<div className="block">
					<div className="text-sm font-medium">{groupName}</div>
					<div className="text-xs text-gray-600">{groupUsers.length} users</div>
				</div>
				<div
					className={"grid grid-cols-3 gap-1"}
					onClick={() => setShowRunningTotal(!showRunningTotal)}
				>
					<PieChartIcon gradient={!showRunningTotal} />
					<ArrowBetweenIcon />
					<BarChartIcon gradient={showRunningTotal} />
				</div>
			</div>
			<Separator />
			<div className={"grid grid-cols-1 gap-3"}>
				{groupUsers.map((user: any) => (
					<div
						key={user.profile_id}
						className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}
						onClick={() => filterTransactionsByUser(user.profile_id)}
					>
						<div className={"flex items-center justify-center"}>
							{user.profiles.avatar_url ? (
								<Image
									src={user.profiles.avatar_url}
									className={"w-6 h-6 rounded-full"}
									height={24}
									width={24}
									alt={"user avatar"}
								/>
							) : (
								<DefaultAvatar
									size={24}
									name={user.profiles.username}
									variant="beam"
									colors={theme.colors.avatar}
								/>
							)}
						</div>
						<div className={"text-ellipsis overflow-hidden whitespace-nowrap"}>
							{user.profiles.username} {user.profile_id === profile.id && <span>(you)</span>}
						</div>
						<div className={"font-mono font-medium tracking-tighter"}>
							{!showRunningTotal ? (
								<>{displayAmount(user.amount_owed)}</>
							) : (
								<>
									$
									{(user.amount_paid_transactions + user.amount_paid_users).toLocaleString(
										undefined,
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										},
									)}{" "}
									/{" "}
									<span className={"font-mono font-medium text-gray-600"}>
										$
										{user.split_amount.toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
								</>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
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
			"id, group_id, amount, from_profile_id, to_profile_id, from_user:from_profile_id(username, avatar_url), to_user:to_profile_id(username, avatar_url)",
		)
		.eq("group_id", gid);

	const { data: payments } = await supabase
		.from("payments")
		.select(
			"id, group_id, amount, from_user:from_profile_id(id, username, avatar_url), to_user:to_profile_id(id, username, avatar_url)",
		)
		.eq("group_id", gid);

	const sortedTransactions =
		transactions && transactions.length > 0 && R.reverse(sortByDate(transactions));

	return {
		props: { ...props, transactions: sortedTransactions, users, balances, payments },
		redirect,
	};
}

export default Group;
