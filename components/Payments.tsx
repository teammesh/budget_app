import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "./Button";
import { definitions } from "../types/supabase";
import { Loading } from "@/components/Loading";
import { PaymentsContainer } from "./PaymentsContainer";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalContent } from "@/components/Modal";
import { isEmpty } from "ramda";
import { displayAmount } from "./Amount";
import { Content } from "@/components/Main";
import { tempStore } from "@/utils/store";

export default function Payments({ gid, setShowPayments }: { gid: string; setShowPayments: any }) {
	const profile_id = supabase.auth.session()?.user?.id;
	const [isLoading, setIsLoading] = useState<any>(false);
	const balances = tempStore((state) => state.balances);

	const userBalances = balances.filter(
		(x: definitions["balances"]) => x.from_profile_id === profile_id,
	);
	const groupBalances = balances.filter(
		(x: definitions["balances"]) => x.from_profile_id !== profile_id,
	);

	const handleMarkAsPaid = async () => {
		if (isEmpty(userBalances)) {
			alert("You do not have any pending balances!");
			return;
		}

		setIsLoading(true);
		const userPayments = userBalances?.map((userBalance: any) => ({
			group_id: gid,
			from_profile_id: profile_id,
			to_profile_id: userBalance.to_profile_id,
			amount: Math.abs(userBalance.amount),
		}));
		console.log(userPayments);
		const { error } = await supabase.from("payments").insert(userPayments);

		if (error) {
			alert(error.message);
		} else {
			alert("Payment successful!");
		}
		setIsLoading(false);
	};

	const Toolbar = () => (
		<div className={"grid grid-cols-[auto_1fr] justify-center gap-8 pt-3 px-3"}>
			<div className={"grid grid-cols-1 gap-1"}>
				<div className={"font-mono tracking-tighter text-sm"}>Your total payment:</div>
				<div className={"text-xl tracking-tight leading-none"}>
					{userBalances.length === 0
						? "--"
						: displayAmount(
								userBalances.reduce((prev: any, curr: any) => {
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
				<ModalContent>
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
				</ModalContent>
			</Dialog.Root>
		</div>
	);

	return (
		<>
			<Content className={"bg-black p-3 grid grid-cols-1 gap-4 content-start overflow-auto"}>
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
			</Content>
			<Toolbar />
		</>
	);
}
