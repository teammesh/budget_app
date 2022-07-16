import { displayAmount } from "@/components/Amount";
import { forwardRef, useEffect, useRef, useState } from "react";
import { styled } from "@stitches/react";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import theme from "@/styles/theme";
import { tempStore, uiStore } from "@/utils/store";
import { GROUP_FEED_MODE } from "@/constants/components.constants";
import { definitions } from "../types/supabase";
import { ArrowBetweenIcon, BarChartIcon, PieChartIcon } from "@/components/icons";
import { Separator } from "@/components/Separator";
import Image from "next/image";
import { PaginatedHeader } from "@/components/text";
import { Swiper, SwiperSlide } from "swiper/react";
import { Activity } from "@/components/Activity";
import { isEmpty } from "ramda";
import { PaymentActivity } from "@/components/PaymentActivity";
import Link from "next/link";
import { SharedTransaction } from "@/components/SharedTransaction";

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
		<Avatar.Root>
			<Avatar.Image />
			<Avatar.Fallback>
				<DefaultAvatar
					size={32}
					name={group.groups.name}
					variant="marble"
					colors={theme.colors.avatar}
				/>
			</Avatar.Fallback>
		</Avatar.Root>
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
						<Activity />
					</div>
				</SwiperSlide>
				<SwiperSlide className={"w-full min-h-8"}>
					<div className={"grid grid-cols-1 gap-2"}>
						{!isEmpty(userPayments) &&
							userPayments.map((x) => <PaymentActivity payment={x} key={x.id} />)}
					</div>
				</SwiperSlide>
				<SwiperSlide className={"w-full min-h-8"}>
					<TransactionList groupUsers={groupUsers} />
				</SwiperSlide>
			</Swiper>
			<DummyComponent headerContRef={headerContRef} />
		</>
	);
};

const TransactionList = ({ groupUsers }: { groupUsers: any }) => {
	const filteredTransactions = tempStore((state) => state.filteredTransactions);

	return (
		<div className={"grid grid-cols-1 gap-2"}>
			{!isEmpty(filteredTransactions) &&
				filteredTransactions.map((x) => (
					<Link href={`/transaction/${encodeURIComponent(x.id)}`} key={x.id} passHref>
						<SharedTransaction transaction={x} groupUsers={groupUsers} />
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
