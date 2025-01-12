import React from "react";
import theme from "@/styles/theme";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/Button";
import { supabase } from "@/utils/supabaseClient";
import Script from "next/script";
import { populateAccounts } from "@/services/accountService";
import { tempStore } from "@/utils/store";
import * as R from "ramda";

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
			environment: "sandbox", // or "production" as needed
			onSuccess: async (enrollment : TellerConnectEnrollment) => {
				// Handle successful enrollment
				const { accessToken, user, enrollment: tellerEnrollment } = enrollment;

				// Save the enrollment to Supabase
				const { data, error } = await supabase
					.from("teller_auth")
					.insert({
						profile_id: supabase.auth.session()?.user?.id,
						access_token: accessToken,
						institution_name: tellerEnrollment.institution.name,
						enrollment_id: tellerEnrollment.id,
						user_id: user.id,
					});

				if (error) {
					console.error("Error saving Teller enrollment:", error);
					return;
				}

				// Fetch accounts
				const response = await fetch("/api/tellerGetAccounts", {
					method: "POST",
					body: JSON.stringify({
						access_token: accessToken,
						profile_id: supabase.auth.session()?.user?.id,
					}),
				});

				if (data && !R.isEmpty(data)) {
					const indexedData = R.indexBy(R.prop("enrollment_id"), data);
					tempStore.getState().setTellerAuth(indexedData);
				}

				const accounts = await response.json();
				console.log("Fetched accounts:", accounts);
				await populateAccounts(accessToken, accounts);
			},
			onExit: () => {
				console.log("User closed Teller Connect");
			},
			onFailure: (error: any) => {
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
