// services/accountService.ts
import { supabase } from "@/utils/supabaseClient";
import { tempStore } from "@/utils/store";
import * as R from "ramda";
import { getTransactions } from "./transactionService";

export const fetchAccounts = async (setShowAccounts) => {
	const profile_id = supabase.auth.session()?.user?.id;
	const setAccounts = tempStore.getState().setAccounts;

	try {
		const { data, error } = await supabase
			.from("teller_accounts")
			.select()
			.eq("profile_id", profile_id);

		if (error) throw error;

		if (data && !R.isEmpty(data)) {
			const indexedAccounts = R.indexBy(R.prop("account_id"), data);
			setAccounts(indexedAccounts);

			// Automatically fetch transactions for the first account
			if (data[0]) {
				await getTransactions(R.values(tempStore.getState().tellerAuth)[0].access_token, data[0].account_id);
				setShowAccounts([data[0].account_id]);
			}

			return indexedAccounts;
		}

		return {};
	} catch (error) {
		console.error("Error fetching accounts:", error);
		return {};
	}
};

export const addNewAccount = async (enrollment: any) => {
	const { accessToken, user, enrollment: tellerEnrollment } = enrollment;
	const setAccounts = tempStore.getState().setAccounts;

	try {
		const { data, error } = await supabase
			.from("plaid_items")
			.insert({
				profile_id: supabase.auth.session()?.user?.id,
				access_token: accessToken,
				institution_name: tellerEnrollment.institution.name,
				item_id: tellerEnrollment.id,
				account_id: user.id,
				last_four_digits: null,
			});

		if (error) throw error;

		const currentAccounts = tempStore.getState().accounts;
		const newAccount = {
			access_token: accessToken,
			account_id: user.id,
			name: tellerEnrollment.institution.name,
			last_four_digits: null,
		};

		const updatedAccounts = { ...currentAccounts, [user.id]: newAccount };
		setAccounts(updatedAccounts);

		// Fetch transactions for the new account
		await getTransactions(accessToken, user.id);

		return updatedAccounts;
	} catch (error) {
		console.error("Error adding new account:", error);
		return {};
	}
};
