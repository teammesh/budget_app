import { PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";

export function PlaidLink() {
	const [linkToken, setLinkToken] = useState("");

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setLinkToken(public_token);
			await fetch("/api/plaidExchangeToken", {
				method: "post",
				body: JSON.stringify({
					public_token,
					profile_id: supabase.auth.session()?.user?.id,
				}),
			});
		},
		onExit: (err, metadata) => {},
		onEvent: (eventName, metadata) => {},
		token: linkToken,
		//required for OAuth; if not using OAuth, set to null or omit:
	};

	useEffect(() => {
		fetch("/api/plaidCreateLinkToken", {
			method: "post",
			body: JSON.stringify({
				profile_id: supabase.auth.session()?.user?.id,
			}),
		}).then((res) =>
			res.json().then((token) => {
				setLinkToken(token);
			}),
		);
	}, []);

	const { open, exit, ready } = usePlaidLink(config);
	return (
		<button
			onClick={(e) => {
				open();
			}}
			className="button block"
		>
			Plaid
		</button>
	);
}
