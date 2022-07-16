import { ActivityEditedIcon, ActivityPaidIcon, ActivitySharedIcon } from "@/components/icons";
import { PrimaryBox } from "@/components/boxes";

export const Activity = ({ type }: { type?: string }) => {
	return (
		<PrimaryBox>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-4"}>
				<ActivitySharedIcon />
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>
						<b>eric</b> shared a new transaction
					</p>
					<p className={"text-sm text-gray-600 font-mono tracking-tighter"}>4 hours ago</p>
				</div>
			</div>
		</PrimaryBox>
	);

	return (
		<PrimaryBox>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-4"}>
				<ActivityEditedIcon />
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>
						<b>eric</b> edited a transaction
					</p>
					<p className={"text-sm text-gray-600 font-mono tracking-tighter"}>4 hours ago</p>
				</div>
			</div>
		</PrimaryBox>
	);

	return (
		<PrimaryBox>
			<div className={"grid grid-cols-[auto_1fr_auto] gap-4"}>
				<ActivityPaidIcon />
				<div className={"grid grid-cols-1"}>
					<p className={"text-sm"}>
						<b>eric</b> paid <b>cynthia</b>
					</p>
					<p className={"text-sm text-gray-600 font-mono tracking-tighter"}>4 hours ago</p>
				</div>
			</div>
		</PrimaryBox>
	);
};
