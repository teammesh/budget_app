import {
	ActivityEditedIcon,
	ActivityPaidIcon,
	ActivityRemovedIcon,
	ActivitySharedIcon,
} from "@/components/icons";
import { PrimaryBox } from "@/components/boxes";
import { DateTime } from "luxon";

export const Activity = ({ activity }: { activity: any }) => {
	const username = activity.user.username;
	const toUsername = activity.to_user?.username;

	const tableNames = {
		transactions: "shared_transactions",
		payments: "payments",
	};

	const activityType = {
		insert: "INSERT",
		update: "UPDATE",
		delete: "DELETE",
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

	const calculateAgo = ( timeAgo: string) => {
		const now = DateTime.now();
		const duration = now.diff(DateTime.fromISO(timeAgo), ["years", "months", "days", "hours", "seconds"]);

		return now.minus(duration).toRelative();
	};

	return (
		<PrimaryBox key={activity.id}>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-4"}>
				{iconMap[activity.table_name][activity.type]}
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>{descriptionMap[activity.table_name][activity.type]}</p>
					<p className={"text-sm text-gray-600 font-mono tracking-tighter"}>
						{calculateAgo(activity.created_at)}
					</p>
				</div>
			</div>
		</PrimaryBox>
	);
};
