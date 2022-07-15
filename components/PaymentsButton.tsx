import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon, CheckCircledIcon  } from "@radix-ui/react-icons";
import { isEmpty } from "ramda";
import { Button } from "./Button";
import * as Dialog from "@radix-ui/react-dialog";
import { Content } from "@/components/Modal";

export default function PaymentsButton({ gid, setShowPayments}: { gid: string, setShowPayments: any }) {
	const profile_id = supabase.auth.session()?.user?.id;

	const handleMarkAsPaid = async () => {
		const { data: userBalances } = await supabase.from("balances").select().eq("from_profile_id", profile_id).eq("group_id", gid);
		console.log(userBalances);

		if (isEmpty(userBalances)) {
			alert("You do not have any pending balances!");
			return;
		}

		const userPayments = userBalances?.map((userBalance) => ({
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

	return (
		<div className={"grid grid-cols-[1fr]"}>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<Button size={"sm"} background={theme.colors.gradient.a}>
						<CheckCircledIcon /> Mark as paid
					</Button>
				</Dialog.Trigger>
				<Content>
					<div className={"grid grid-cols-1 gap-2 text-center"}>
						<Dialog.Title className={"font-medium text-md"}>Are you sure you want to pay?</Dialog.Title>
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
}
