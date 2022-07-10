import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { styled } from "@stitches/react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { TextGradient } from "./text";
import { definitions } from "../types/supabase";

export default function Payments({
	gid,
	setShowPayments,
	balances,
}: {
	gid: string;
	setShowPayments: any;
	balances: definitions["balances"];
}) {
	const profile_id = supabase.auth.session()?.user?.id;
	const [userBalances, setUserBalances] = useState<any>(balances);
	const [groupBalances, setGroupBalances] = useState<any>([]);

	useEffect(() => {
		supabase
			.from(`balances:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchBalances();
			})
			.subscribe();

		return () => {
			supabase.removeSubscription(
				supabase.getSubscriptions()[supabase.getSubscriptions().length - 1],
			);
		};
	}, []);

	const fetchBalances = () => {
		return supabase
			.from("balances")
			.select(
				"id, group_id, amount, from_profile_id, to_profile_id, from_user:from_profile_id(username), to_user:to_profile_id(username), from_avatar:from_profile_id(avatar_url), to_avatar:to_profile_id(avatar_url)",
			)
			.eq("group_id", gid)
			.then(({ data, error }) => {
				console.log(data);
				setUserBalances(data?.filter((balance) => balance.from_profile_id === profile_id));
				setGroupBalances(data?.filter((balance) => balance.from_profile_id !== profile_id));
			});
	};

	const Container = styled("div", {
		position: "fixed",
		top: 0,
		bottom: "124px",
		left: 0,
		right: 0,
		zIndex: 10,
	});

	return (
		<Container className={"bg-black p-3 grid grid-cols-1 gap-4 content-start overflow-auto"}>
			<div className={"flex justify-between"}>
				<Button
					size={"sm"}
					style={{ background: theme.colors.gradient.a }}
					onClick={() => {
						setShowPayments(false);
					}}
				>
					<ArrowLeftIcon />
					Cancel
				</Button>
			</div>
			<PaymentContainer
				title={"Your payments"}
				description={"Send these amounts to the designated person(s)"}
				balances={userBalances}
				emptyText={"You do not have any open balances"}
			/>
			<PaymentContainer
				title={"Group payments"}
				description={"Payments that others in your group need to make"}
				balances={groupBalances}
				emptyText={"The group currently does not have any open balances"}
			/>
		</Container>
	);
}

const PaymentContainer = ({
	title,
	description,
	balances,
	emptyText,
}: {
	title: string;
	description: string;
	balances: Array<any>;
	emptyText: string;
}) => {
	const profile_id = supabase.auth.session()?.user?.id;

	return (
		<div className={"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-6"}>
			<div className={"grid grid-cols-1 gap-1"}>
				<div className="text-sm">{title}</div>
				<div className="text-xs text-gray-600">{description}</div>
			</div>
			<div className="grid grid-cols-1 gap-4">
				{balances.length > 0 ? (
					balances.map((x, i) => (
						<div key={x.id}>
							<div className="grid grid-cols-[auto_1fr_auto] items-center">
								<Avatar.Root>
									<Avatar.Image />
									<Avatar.Fallback>
										<DefaultAvatar
											size={48}
											name={x.from_user.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									</Avatar.Fallback>
								</Avatar.Root>
								<div className="text-sm text-center">
									{x.from_user.username === profile_id ? (
										"You pay "
									) : (
										<>{x.from_user.username} pays </>
									)}
									{x.to_user.username}
									<div className={"text-sm font-mono font-medium tracking-tight"}>
										<TextGradient gradient={theme.colors.gradient.f}>
											${Math.abs(x.amount)}
										</TextGradient>
									</div>
								</div>
								<Avatar.Root>
									<Avatar.Image />
									<Avatar.Fallback>
										<DefaultAvatar
											size={48}
											name={x.to_user.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									</Avatar.Fallback>
								</Avatar.Root>
							</div>
						</div>
					))
				) : (
					<div className="text-xs p-3 flex justify-center text-gray-600">{emptyText}</div>
				)}
			</div>
		</div>
	);
};
