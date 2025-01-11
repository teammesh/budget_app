import React, { useEffect } from "react";
import theme from "@/styles/theme";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/Button";
import { tempStore } from "@/utils/store";
import { supabase } from "@/utils/supabaseClient";
import Script from "next/script";

declare global {
	interface Window {
		TellerConnect: {
			setup: (config: any) => {
				open: () => void;
			};
		};
		tellerConnect?: {
			open: () => void;
		};
	}
}

type TellerConnectEnrollment = {
	accessToken: string;
	user: {
		id: string;
	};
	enrollment: {
		id: string;
		institution: {
			name: string;
		};
	};
	signatures: string[];
}

export const TellerConnect = () => {
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const tellerConnect = React.useRef<any>(null);

	const handleConnect = () => {
		tellerConnect.current.open();
	};

	const onReady = () => {
		tellerConnect.current = window.TellerConnect.setup({
			applicationId: process.env.NEXT_PUBLIC_TELLER_APP_ID,
			products: ["transactions", "balance", "identity"],
			environment: "development", // or "production" as needed
			onSuccess: async (enrollment : TellerConnectEnrollment) => {
				// Handle successful enrollment
				const { accessToken, user, enrollment: tellerEnrollment } = enrollment;

				// Save the enrollment to Supabase
				const { data, error } = await supabase
					.from("plaid_items")
					.insert({
						profile_id: supabase.auth.session()?.user?.id,
						access_token: accessToken,
						name: tellerEnrollment.institution.name,
						account_id: user.id,
					});

				if (error) {
					console.error("Error saving Teller enrollment:", error);
					return;
				}

				// Update local state
				const accounts = tempStore.getState().accounts;
				tempStore.getState().setAccounts({
					...accounts,
					[user.id]: {
						access_token: accessToken,
						account_id: user.id,
						name: tellerEnrollment.institution.name,
					},
				});
			},
			onExit: () => {
				console.log("User closed Teller Connect");
			},
			onFailure: (error) => {
				console.error("Teller Connect enrollment failed:", error);
			},
		});
	};

	return (
		<>
			<Script src="https://cdn.teller.io/connect/connect.js" onReady={onReady}/>
			<Button
				size={"sm"}
				style={{ background: theme.colors.gradient.a }}
				id={"teller-connect"}
				ref={buttonRef}
				onClick={handleConnect}
			>
				<PlusIcon />
				Add payment account
			</Button>
		</>
	);
};
