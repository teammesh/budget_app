import { PlaidLinkOptions } from "react-plaid-link";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore, tempStore } from "@/utils/store";
import { assocPath, dissocPath } from "ramda";

export function plaidLink({ setIsLoading }: { setIsLoading: any }) {
	const linkToken = tempStore.getState().linkToken;
	const setLinkToken = tempStore.getState().setLinkToken;
	const accounts = sessionStore.getState().accounts;
	const setAccounts = sessionStore.getState().setAccounts;

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setIsLoading(true);
			setLinkToken(public_token);
			return fetch("/api/plaidExchangeToken", {
				method: "post",
				body: JSON.stringify({
					public_token,
					profile_id: supabase.auth.session()?.user?.id,
				}),
			})
				.then((res) => res.json())
				.then(({ item_id, access_token }) => {
					return fetch("/api/plaidSavePaymentMethod", {
						method: "post",
						body: JSON.stringify({
							access_token,
							item_id,
							profile_id: supabase.auth.session()?.user?.id,
						}),
					})
						.then((res) => res.json())
						.then(({ data, error }) => {
							if (error) return alert(error.message);
							return setAccounts(assocPath([access_token], data[0], accounts));
						});
				})
				.catch(({ error }) => alert(error.message))
				.finally(() => setIsLoading(false));
		},
		token: linkToken,
	};

	return config;
}

export function plaidLinkUpdate({
	setIsLoading,
	linkToken,
	access_token,
}: {
	setIsLoading: any;
	linkToken: string;
	access_token: string;
}) {
	const accounts = sessionStore.getState().accounts;
	const setAccounts = sessionStore.getState().setAccounts;

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setIsLoading(false);
			setAccounts(dissocPath([access_token, "invalid"], accounts));
		},
		token: linkToken,
	};

	return config;
}
