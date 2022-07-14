import theme from "@/styles/theme";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Button } from "./Button";

export default function PaymentsButton({ setShowPayments }: { setShowPayments: any }) {
	return (
		<div className={"grid grid-cols-[1fr]"}>
			<Button
				size={"sm"}
				background={theme.colors.gradient.a}
				onClick={() => console.log("Clicked mark as paid")}
			>
				<CheckCircledIcon /> Mark as paid
			</Button>
		</div>
	);
}
