import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import { PlaidLinkOptions, usePlaidLink } from "react-plaid-link";

export default function Home() {
	const [session, setSession] = useState(null);
	const [linkToken, setLinkToken] = useState("");

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setLinkToken(public_token);
			await fetch("/api/plaidExchangeToken", {
				method: "get",
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
		<div className="container" style={{ padding: "50px 0 100px 0" }}>
			{!session ? <Auth /> : <Account key={session.user.id} session={session} />}
			<button
				onClick={(e) => {
					open();
				}}
				className="button block"
			>
				Plaid
			</button>
		</div>
	);
}
