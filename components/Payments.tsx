import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { styled } from "@stitches/react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { definitions } from "../types/supabase";
import { Loading } from "@/components/Loading";
import { PaymentsContainer } from "./PaymentsContainer";
import * as Dialog from "@radix-ui/react-dialog";
import { Content } from "@/components/Modal";
import { uiStore } from "@/utils/store";
import { isEmpty } from "ramda";
import { displayAmount } from "./Amount";

export default function Payments({
	gid,
	setShowPayments,
	balances,
}: {
	gid: string;
	setShowPayments: any;
	balances: definitions["balances"] | any;
}) {
	const profile_id = supabase.auth.session()?.user?.id;
	const [isLoading, setIsLoading] = useState<any>(true);

	const [userBalances, setUserBalances] = useState<any>(
		balances.filter((x: definitions["balances"]) => x.from_profile_id === profile_id),
	);
	const [groupBalances, setGroupBalances] = useState<any>(
		balances.filter((x: definitions["balances"]) => x.from_profile_id !== profile_id),
	);

	console.log(balances);

	useEffect(() => {
		uiStore.getState().setToolbar(toolbar);

		supabase
			.from(`balances:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchBalances();
			})
			.subscribe();
		console.log(supabase.getSubscriptions());
		setIsLoading(false);

		return () => {
			supabase.removeSubscription(
				// @ts-ignore
				supabase.getSubscriptions().at(supabase.getSubscriptions().length - 1),
			);
		};
	}, []);

	const fetchBalances = () => {
		return supabase
			.from("balances")
			.select(
				"id, group_id, amount, from_profile_id, to_profile_id, from_user:from_profile_id(id, username, avatar_url), to_user:to_profile_id(id, username, avatar_url)",
			)
			.eq("group_id", gid)
			.then(({ data, error }) => {
				console.log(data);
				setUserBalances(data?.filter((balance) => balance.from_profile_id === profile_id));
				setGroupBalances(data?.filter((balance) => balance.from_profile_id !== profile_id));
			});
	};

	const handleMarkAsPaid = async () => {
		if (isEmpty(userBalances)) {
			alert("You do not have any pending balances!");
			return;
		}

		const userPayments = userBalances?.map((userBalance: any) => ({
			group_id: gid,
			from_profile_id: profile_id,
			to_profile_id: userBalance.to_profile_id,
			amount: Math.abs(userBalance.amount),
		}));
		const { error } = await supabase.from("payments").insert(userPayments);

		if (error) {
			alert(error);
		} else {
			alert("Payment successful!");
		}
	};

	const toolbar = () => (
		<div className={"grid grid-cols-[auto_1fr] justify-center gap-8"}>
			<div className={"grid grid-cols-1 gap-1"}>
				<div className={"font-mono tracking-tighter text-sm"}>Your total payment:</div>
				<div className={"text-xl tracking-tight leading-none"}>
					{userBalances.length === 0
						? "--"
						: displayAmount(
							userBalances.reduce((prev, curr) => {
								if (!curr.amount) return prev;
								return curr.amount + prev;
							}, 0),
					)}
				</div>
			</div>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<Button size={"sm"} background={theme.colors.gradient.a}>
						<CheckCircledIcon /> Mark as paid
					</Button>
				</Dialog.Trigger>
				<Content>
					<div className={"grid grid-cols-1 gap-2 text-center"}>
						<Dialog.Title className={"font-medium text-md"}>
							Are you sure you want to pay?
						</Dialog.Title>
					</div>
					<div className={"grid grid-cols-1 gap-2"}>
						<Dialog.Close asChild>
							<Button size={"sm"} border={theme.colors.gradient.a}>
								<ArrowLeftIcon />
								Cancel
							</Button>
						</Dialog.Close>
						<Dialog.Close asChild>
							<Button
								size={"sm"}
								background={theme.colors.gradient.a}
								onClick={() => handleMarkAsPaid()}
							>
								<CheckCircledIcon />
								Pay
							</Button>
						</Dialog.Close>
					</div>
				</Content>
			</Dialog.Root>
		</div>
	);

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
			<PaymentsContainer
				title={"Your payments"}
				description={"Send these amounts to the designated person(s)"}
				balances={userBalances}
				emptyText={"You do not have any open balances"}
				profileId={profile_id}
			/>
			<PaymentsContainer
				title={"Group payments"}
				description={"Payments that others in your group need to make"}
				balances={groupBalances}
				emptyText={"The group currently does not have any open balances"}
				profileId={profile_id}
			/>
			{isLoading && <Loading />}
		</Container>
	);
}
