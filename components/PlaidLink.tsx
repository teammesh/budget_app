import { PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { supabase } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import { sessionStore } from "@/utils/store";
import theme from "@/styles/theme";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/Button";

export function PlaidLink() {
	const [linkToken, setLinkToken] = useState("");
	const accounts = sessionStore.getState().accounts;
	const setAccounts = sessionStore.getState().setAccounts;

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setLinkToken(public_token);
			fetch("/api/plaidExchangeToken", {
				method: "post",
				body: JSON.stringify({
					public_token,
					profile_id: supabase.auth.session()?.user?.id,
				}),
			})
				.then((res) => res.json())
				.then(({ data }) => setAccounts([...accounts, ...data]));
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

	const { open, error } = usePlaidLink(config);

	return (
		<Button size={"sm"} style={{ background: theme.colors.gradient.a }} onClick={() => open()}>
			<PlusIcon />
			Add payment account
		</Button>
	);
}
