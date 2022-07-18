import { ActivityEditedIcon, ActivityPaidIcon, ActivitySharedIcon } from "@/components/icons";
import { PrimaryBox } from "@/components/boxes";
import { tempStore } from "@/utils/store";
import { isEmpty } from "ramda";

export const Activity = ({activity}: {activity: any}) => {
	const activities = tempStore((state) => state.groupActivities);

	const tableNames = {
		transactions: "shared_transactions",
		payments: "payments",
	};

	const icon = (type: string) => {
		switch(type) {
			case "INSERT": 
				return <ActivitySharedIcon />;
			case "UPDATE":
				return <ActivityEditedIcon />;
			case "DELETE":
				return <ActivityEditedIcon />;
		}
	};

	const description = (profile: any, table_name: string, type: string, to_profile?: any) => {
		const username = profile.username;
		if (table_name === tableNames.transactions) {
			if (type === "INSERT") {
				return <><b>{username}</b> shared a new transaction </>;
			} else if (type === "UPDATE") {
				return <><b>{username}</b> edited a transaction</>;
			} else {
				return <><b>{username}</b> deleted a transaction</>;
			}
		} else if (table_name === tableNames.payments) {
			if (type === "INSERT") {
				return <><b>{username}</b> paid <b>{to_profile.username}</b></>;
			} else if (type === "UPDATE") {
				return <><b>{username}</b> updated payment to <b>{to_profile.username}</b></>;
			} else {
				return <><b>{username}</b> deleted payment to <b>{to_profile.username}</b></>;
			}
		}
	};

	return (	
		<PrimaryBox key={activity.id}>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-4"}>
				{icon(activity.type)}
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>
						{description(activity.user, activity.table_name, activity.type, activity.to_user)}
					</p>
					<p className={"text-sm text-gray-600 font-mono tracking-tighter"}>4 hours ago</p>
				</div>
			</div>
		</PrimaryBox>
	);
};