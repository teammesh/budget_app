import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
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
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import { useEffect, useState } from "react";
import { uiStore } from "@/utils/store";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";
import { Input } from "@/components/Input";
import { definitions } from "../../types/supabase";
import { Slider } from "@/components/Slider";
import { AuthUser } from "@supabase/supabase-js";
import { FormBox, PrimaryBox } from "@/components/boxes";
import { Separator } from "@/components/Separator";
import * as R from "ramda";

const Transaction = ({
	user,
	profile,
	transaction,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
	transaction: definitions["shared_transactions"] | any;
}) => {
	const router = useRouter();
	const groupUsers = transaction.groups.profiles_groups;
	const [isEditing, setIsEditing] = useState(false);
	const amountDivisor = 1 / groupUsers.length;
	const [amountRatios, setAmountRatios] = useState<any>(
		R.indexBy(
			// @ts-ignore
			R.prop("profile_id"),
			R.map((x) => {
				return {
					amount: (transaction.amount * amountDivisor).toFixed(2),
					profile_id: x.profile_id,
				};
			}, groupUsers),
		),
	);

	const deleteTransaction = async () => {
		await supabase
			.from("shared_transactions")
			.delete()
			.eq("transaction_id", transaction.transaction_id);
		router.push(`/group/${transaction.groups.id}`);
	};

	useEffect(() => {
		uiStore.getState().setToolbar(null);
	}, []);

	useEffect(() => {
		const toolbarProps = () => {
			return isEditing ? (
				<div className={"grid grid-cols-[auto_1fr] gap-2"}>
					<Button size={"sm"} border={theme.colors.gradient.a} onClick={() => setIsEditing(false)}>
						<Cross2Icon /> Cancel
					</Button>
					<Button
						size={"sm"}
						background={theme.colors.gradient.a}
						onClick={() => setIsEditing(false)}
					>
						<CheckIcon /> Save changes
					</Button>
				</div>
			) : (
				<div className={"grid grid-cols-1"}>
					<Button
						size={"sm"}
						background={theme.colors.gradient.a}
						onClick={() => setIsEditing(true)}
					>
						<Pencil1Icon /> Edit transaction
					</Button>
				</div>
			);
		};

		uiStore.getState().setToolbar(toolbarProps);
	}, [isEditing]);

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
					onClick={deleteTransaction}
				>
					<TrashIcon />
					Delete
				</Button>
			</div>
			<SharedTransaction transaction={transaction} groupUsers={groupUsers} />
			{isEditing && (
				<FormBox>
					<Field>
						<Label>Transaction name</Label>
						<Input id="transaction-name" type="text" value={transaction.name} />
					</Field>
					<Field>
						<Label>Merchant name</Label>
						<Input id="merchant-name" type="text" value={transaction.merchant_name} />
					</Field>
					<Field>
						<Label>Transaction date</Label>
						<Input id="date" type="date" value={transaction.date} />
					</Field>
				</FormBox>
			)}
			{isEditing && (
				<FormBox>
					<Field>
						<Label>Transaction amount</Label>
						<Input id="amount" type="number" value={transaction.amount} />
					</Field>
					<Separator />
					<div className={"grid grid-cols-1 gap-3"}>
						{groupUsers.map((user: any) => (
							<div className={"grid grid-cols-1 gap-2"} key={user.profile_id}>
								<div className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}>
									<Avatar.Root>
										<Avatar.Image />
										<Avatar.Fallback>
											<DefaultAvatar
												size={24}
												name={user.profiles.username}
												variant="beam"
												colors={theme.colors.avatar}
											/>
										</Avatar.Fallback>
									</Avatar.Root>
									<div>
										{user.profiles.username} {user.profile_id === profile.id && " (you)"}
									</div>
									<div className={"grid grid-cols-[auto_auto_auto] gap-1"}>
										<div className={"font-mono font-medium tracking-tight"}>
											$
											{amountRatios[user.profile_id].amount.toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</div>
										<div className={"font-mono font-medium tracking-tight"}>/</div>
										<div className={"font-mono font-medium tracking-tight text-gray-600"}>
											%
											{Math.round(
												(amountRatios[user.profile_id].amount / transaction.amount) * 100,
											)}
										</div>
									</div>
								</div>
								<Slider
									onValueChange={(e: number[]) => {
										// @ts-ignore
										const amtRatios = R.map(
											(x: any) =>
												x.profile_id === user.profile_id
													? { amount: transaction.amount * e[0] * 0.01, profile_id: x.profile_id }
													: {
															amount:
																(transaction.amount * (100 - e[0]) * 0.01) /
																(groupUsers.length - 1),
															profile_id: x.profile_id,
													  },
											amountRatios,
										);

										// @ts-ignore
										setAmountRatios(amtRatios);
									}}
									value={[
										Math.round((amountRatios[user.profile_id].amount / transaction.amount) * 100),
									]}
								/>
							</div>
						))}
					</div>
				</FormBox>
			)}
			{!isEditing && (
				<PrimaryBox>
					<div className="flex justify-between">
						<div className="font-medium text-sm">{transaction.location?.city || "City"}</div>
						<div className="font-medium text-sm capitalize">
							{transaction.payment_channel || "N/A"}
						</div>
					</div>
					<div></div>
					<div className="font-mono font-medium text-sm tracking-tight text-gray-600">
						{transaction?.category.map((c: any) => (
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
						{groupUsers.map((user: any) => (
							<div
								key={user.profile_id}
								className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}
							>
								<Avatar.Root>
									<Avatar.Image />
									<Avatar.Fallback>
										<DefaultAvatar
											size={24}
											name={user.profiles.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									</Avatar.Fallback>
								</Avatar.Root>
								<div>
									{user.profiles.username} {user.profile_id === profile.id && " (you)"}
								</div>
								<div className={"font-mono font-medium tracking-tighter"}>
									$
									{(transaction.amount * amountDivisor).toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</div>
							</div>
						))}
					</div>
				</PrimaryBox>
			)}
		</div>
	);
};

export async function getServerSideProps({ req, params }: { req: RequestData; params: Params }) {
	const { props, redirect } = await verifyUser(req);
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
