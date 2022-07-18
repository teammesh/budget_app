import { displayAmount } from "@/components/Amount";
import { forwardRef, useEffect, useRef, useState } from "react";
import { styled } from "@stitches/react";
import { tempStore, uiStore } from "@/utils/store";
import { GROUP_FEED_MODE } from "@/constants/components.constants";
import { definitions } from "../types/supabase";
import { ArrowBetweenIcon, BarChartIcon, PieChartIcon } from "@/components/icons";
import { Separator } from "@/components/Separator";
import { PaginatedHeader } from "@/components/text";
import { Swiper, SwiperSlide } from "swiper/react";
import { Activity } from "@/components/Activity";
import { isEmpty } from "ramda";
import { PaymentActivity } from "@/components/PaymentActivity";
import Link from "next/link";
import { SharedTransaction } from "@/components/SharedTransaction";
import { Avatar } from "./Avatar";

const Amount = styled("div", {
	"& > span": {
		fontFamily: "var(--custom-font-family-mono)",
	},
});

export const Group = forwardRef(({ group, ...props }: { group: any; props?: any }, ref) => (
	<div
		className="p-3 rounded-md bg-gray-900 grid grid-cols-[32px_1fr_auto] gap-3 items-center cursor-pointer"
		{...props}
		// @ts-ignore
		ref={ref}
	>
		<Avatar avatarUrl={group.groups.avatar_url} avatarName={group.groups.name} variant={"marble"} />
		<div className="block">
			<div className="text-sm">{group.groups.name}</div>
			<div className="text-sm text-gray-600">{group.groups.name}</div>
		</div>
		<Amount className="text-sm font-medium font-mono tracking-tight">
			{displayAmount(group.amount_owed)}
		</Amount>
	</div>
));

export const GroupFeed = ({ groupUsers }: { groupUsers: any }) => {
	const swiperRef = useRef<any>();
	const headerContRef = useRef<any>();
	const setGroupFeedMode = uiStore.getState().setGroupFeedMode;
	const userPayments = tempStore((state) => state.userPayments);
	const activities = tempStore((state) => state.groupActivities);

	const PaginatedHeaderCont = styled("div", {
		"-ms-overflow-style": "none",
		scrollbarWidth: "none",

		"&::-webkit-scrollbar": {
			display: "none",
		},
	});

	useEffect(() => {
		setGroupFeedMode(GROUP_FEED_MODE.activity);
	}, []);

	return (
		<>
			<div className={"mt-6"}>
				<PaginatedHeaderCont
					className={"grid grid-cols-[auto_auto_auto] gap-2 overflow-x-auto pl-3 pr-40 pb-1"}
					ref={headerContRef}
				>
					<PaginatedHeader
						onClick={() => {
							setGroupFeedMode(GROUP_FEED_MODE.activity);
							swiperRef.current.slideTo(0);
						}}
					>
						{GROUP_FEED_MODE.activity}
					</PaginatedHeader>
					<PaginatedHeader
						onClick={() => {
							setGroupFeedMode(GROUP_FEED_MODE.payments);
							swiperRef.current.slideTo(1);
						}}
					>
						{GROUP_FEED_MODE.payments}
					</PaginatedHeader>
					<PaginatedHeader
						onClick={() => {
							setGroupFeedMode(GROUP_FEED_MODE.transactions);
							swiperRef.current.slideTo(2);
						}}
					>
						{GROUP_FEED_MODE.transactions}
					</PaginatedHeader>
				</PaginatedHeaderCont>
			</div>
			<Swiper
				spaceBetween={16}
				slidesPerView={"auto"}
				autoHeight={true}
				onSlideChange={(e) => {
					if (e.activeIndex === 0) setGroupFeedMode(GROUP_FEED_MODE.activity);
					if (e.activeIndex === 1) setGroupFeedMode(GROUP_FEED_MODE.payments);
					if (e.activeIndex === 2) setGroupFeedMode(GROUP_FEED_MODE.transactions);
				}}
				onSwiper={(swiper) => (swiperRef.current = swiper)}
			>
				<SwiperSlide className={"w-full min-h-8"}>
					<div className={"grid grid-cols-1 gap-2"}>
						{!isEmpty(activities) ?
							activities.map((activity) => <Activity activity={activity} key={activity.id} /> )
							: <div className="grid grid-cols-[auto_1fr_auto] p-3">No activities</div>
						}
					</div>
				</SwiperSlide>
				<SwiperSlide className={"w-full min-h-8"}>
					<div className={"grid grid-cols-1 gap-2"}>
						{!isEmpty(userPayments) ?
							userPayments.map((x) => <PaymentActivity payment={x} key={x.id} />)
							: <div className="grid grid-cols-[auto_1fr_auto] p-3">No payments</div>
						}
					</div>
				</SwiperSlide>
				<SwiperSlide className={"w-full min-h-8"}>
					<TransactionList />
				</SwiperSlide>
			</Swiper>
			<DummyComponent headerContRef={headerContRef} />
		</>
	);
};

const TransactionList = () => {
	const filteredTransactions = tempStore((state) => state.filteredTransactions);

	return (
		<div className={"grid grid-cols-1 gap-2"}>
			{!isEmpty(filteredTransactions) &&
				filteredTransactions.map((x) => (
					<Link href={`/transaction/${encodeURIComponent(x.id)}`} key={x.id} passHref>
						<SharedTransaction transaction={x} />
					</Link>
				))}
		</div>
	);
};
const DummyComponent = ({ headerContRef }: { headerContRef: any }) => {
	const groupFeedMode = uiStore((state) => state.groupFeedMode);

	useEffect(() => {
		for (let i = 0; i <= headerContRef.current.children.length - 1; i++) {
			headerContRef.current.children.item(i).removeAttribute("data-active");
		}

		if (groupFeedMode === GROUP_FEED_MODE.activity)
			headerContRef.current.children[0].setAttribute("data-active", "true");
		if (groupFeedMode === GROUP_FEED_MODE.payments)
			headerContRef.current.children[1].setAttribute("data-active", "true");
		if (groupFeedMode === GROUP_FEED_MODE.transactions)
			headerContRef.current.children[2].setAttribute("data-active", "true");
	}, [groupFeedMode]);

	return <div />;
};

export const GroupSummary = ({
	groupUsers,
	profile,
}: {
	groupUsers: definitions["profiles_groups"][] | any;
	profile: definitions["profiles"];
}) => {
	const [showRunningTotal, setShowRunningTotal] = useState(false);
	const groupName = tempStore((state) => state.groupName);
	const groupAvatar = tempStore((state) => state.groupAvatarUrl);

	useEffect(() => {
		uiStore.getState().setGroupFilterbyUser(null);
		tempStore.getState().setFilteredTransactions(tempStore.getState().sharedTransactions);
	}, []);

	return (
		<div
			className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-4 items-center cursor-pointer"}
		>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-3 items-center"}>
				<div>
					<Avatar avatarUrl={groupAvatar} avatarName={groupName} />
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
			<div className={"grid grid-cols-1 gap-0"}>
				{groupUsers.map((user: any) => (
					<GroupUser
						key={user.profile_id}
						user={user}
						profile={profile}
						showRunningTotal={showRunningTotal}
					/>
				))}
			</div>
		</div>
	);
};

const GroupUser = ({ user, profile, showRunningTotal }: any) => {
	const setFilteredTransactions = tempStore.getState().setFilteredTransactions;
	const groupFilterbyUser = uiStore((state) => state.groupFilterbyUser);
	const setGroupFilterbyUser = uiStore.getState().setGroupFilterbyUser;
	const sharedTransactions = tempStore.getState().sharedTransactions;
	const isSelected = groupFilterbyUser === user.profile_id;

	const filterTransactionsByUser = (profileId: string) => {
		if (isSelected && profileId === user.profile_id) {
			setGroupFilterbyUser(null);
			setFilteredTransactions(sharedTransactions);
		} else {
			setGroupFilterbyUser(profileId);
			setFilteredTransactions(sharedTransactions.filter((x) => x.charged_to === profileId));
		}
	};

	const WrapperStyle = styled("div", {
		// background: isSelected ? theme.colors.gray[700] : "none",
	});

	return (
		<WrapperStyle
			className={`grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3 p-2 rounded-md ${
				isSelected && "bg-blue-700"
			}`}
			onClick={() => filterTransactionsByUser(user.profile_id)}
		>
			<div className={"flex items-center justify-center"}>
				<Avatar avatarUrl={user.profiles.avatar_url} avatarName={user.profiles.username} />
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
						{(user.amount_paid_transactions + user.amount_paid_users).toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}{" "}
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
		</WrapperStyle>
	);
};
