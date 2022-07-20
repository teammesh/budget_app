import {
	ActivityEditedIcon,
	ActivityPaidIcon,
	ActivityRemovedIcon,
	ActivitySharedIcon,
} from "@/components/icons";
import { PrimaryBox } from "@/components/boxes";
import { DateTime } from "luxon";
import Link from "next/link";
import { Separator } from "./Separator";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { PaymentActivity } from "./PaymentActivity";
import { isNil } from "ramda";
import { SharedTransaction } from "./SharedTransaction";
import { Loading } from "./Loading";

export const Activity = ({ activity }: { activity: any }) => {
	const username = activity.user.username;
	const toUsername = activity.to_user?.username;
	const [showMore, setShowMore] = useState(false);
	const [data, setData] = useState<any>();

	const tableNames = {
		transactions: "shared_transactions",
		payments: "payments",
	};

	const activityType = {
		insert: "INSERT",
		update: "UPDATE",
		delete: "DELETE",
	};

	const linkMap = {
		[tableNames.transactions]: `/transaction/${encodeURIComponent(activity.table_item_id)}`,
		[tableNames.payments]: "",
	};

	const iconMap = {
		[tableNames.transactions]: {
			[activityType.insert]: <ActivitySharedIcon />,
			[activityType.update]: <ActivityEditedIcon />,
			[activityType.delete]: <ActivityRemovedIcon />,
		},
		[tableNames.payments]: {
			[activityType.insert]: <ActivityPaidIcon />,
			[activityType.update]: <ActivityEditedIcon />,
			[activityType.delete]: <ActivityRemovedIcon />,
		},
	};

	const descriptionMap = {
		[tableNames.transactions]: {
			[activityType.insert]: (
				<>
					<b>{username}</b> shared a new transaction{" "}
				</>
			),
			[activityType.update]: (
				<>
					<b>{username}</b> edited a transaction
				</>
			),
			[activityType.delete]: (
				<>
					<b>{username}</b> deleted a transaction
				</>
			),
		},
		[tableNames.payments]: {
			[activityType.insert]: (
				<>
					<b>{username}</b> paid <b>{toUsername}</b>
				</>
			),
			[activityType.update]: (
				<>
					<b>{username}</b> updated payment to <b>{toUsername}</b>
				</>
			),
			[activityType.delete]: (
				<>
					<b>{username}</b> deleted payment to <b>{toUsername}</b>
				</>
			),
		},
	};

	const MoreInfoComponent = () => {
		if (data) {
			if (activity.type === activityType.delete) {
				return <div className="p-3">TODO add this back</div>;
			}
			if (activity.table_name === tableNames.payments) {
				return (
					<div className="pt-4">
						<Separator />
						<div className="pt-2">
							<PaymentActivity payment={data[0]} />
						</div>
					</div>
				);
			} else if (activity.table_name === tableNames.transactions) {
				return (
					<div className="pt-4">
						<Separator />
						<Link href={linkMap[activity.table_name]} key={activity.table_item_id} passHref>
							<div className="pt-2">
								<SharedTransaction transaction={data[0]} />
							</div>
						</Link>
					</div>
				);
			}
		}
		return <Loading />;
	};

	useEffect(() => {
		const moreInfo = async () => {
			console.log(data);
			if (showMore && isNil(data)) {
				if (activity.table_name === tableNames.payments) {
					const { data, error } = await supabase
						.from("payments")
						.select("*, from_user:from_profile_id(*), to_user:to_profile_id(*)")
						.eq("id", activity.table_item_id);
					console.log(data);
					setData(data);
				} else if (activity.table_name === tableNames.transactions) {
					const { data, error } = await supabase
						.from("shared_transactions")
						.select("*, profiles(username, avatar_url)")
						.eq("id", activity.table_item_id);
					console.log(data);
					console.log(error);
					setData(data);
				}
			}
		};
		moreInfo();
	}, [showMore]);

	const calculateAgo = (timeAgo: string) => {
		const now = DateTime.now();
		const duration = now.diff(DateTime.fromISO(timeAgo), [
			"years",
			"months",
			"days",
			"hours",
			"seconds",
		]);

		return now.minus(duration).toRelative();
	};

	return (
		<PrimaryBox key={activity.id}>
			<div
				className={"grid grid-cols-[auto_1fr_auto] gap-4"}
				onClick={() => setShowMore(!showMore)}
			>
				{iconMap[activity.table_name][activity.type]}
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>{descriptionMap[activity.table_name][activity.type]}</p>
					<p className={"text-sm text-gray-500 font-mono tracking-tighter"}>
						{calculateAgo(activity.created_at)}
					</p>
				</div>
			</div>
			{showMore && <MoreInfoComponent />}
		</PrimaryBox>
	);
};
