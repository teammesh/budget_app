import { PlaidLinkOptions } from "react-plaid-link";
import { supabase } from "@/utils/supabaseClient";
import { tempStore } from "@/utils/store";
import { assocPath, dissocPath } from "ramda";
import { definitions } from "../types/supabase";

export function plaidLink({ setIsLoading }: { setIsLoading: any }) {
	const linkToken = tempStore.getState().linkToken;
	const setLinkToken = tempStore.getState().setLinkToken;
	const accounts = tempStore.getState().accounts;
	const setAccounts = tempStore.getState().setAccounts;

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
						.then(async ({ data, error }: { data: definitions["plaid_items"][]; error?: any }) => {
							if (error) return alert(error.message);
							await fetch("/api/plaidCreateLinkToken", {
								method: "post",
								body: JSON.stringify({
									profile_id: supabase.auth.session()?.user?.id,
								}),
							}).then((res) =>
								res.json().then((token) => tempStore.getState().setLinkToken(token)),
							);
							return setAccounts(assocPath([item_id], data[0], accounts));
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
	item_id,
}: {
	setIsLoading: any;
	linkToken: string;
	item_id: string;
}) {
	const accounts = tempStore.getState().accounts;
	const setAccounts = tempStore.getState().setAccounts;

	// The usePlaidLink hook manages Plaid Link creation
	// It does not return a destroy function;
	// instead, on unmount it automatically destroys the Link instance
	const config: PlaidLinkOptions = {
		onSuccess: async (public_token, metadata) => {
			setIsLoading(false);
			setAccounts(dissocPath([item_id, "invalid"], accounts));
			return await fetch("/api/plaidCreateLinkToken", {
				method: "post",
				body: JSON.stringify({
					profile_id: supabase.auth.session()?.user?.id,
				}),
			}).then((res) => res.json().then((token) => tempStore.getState().setLinkToken(token)));
		},
		token: linkToken,
	};

	return config;
}
