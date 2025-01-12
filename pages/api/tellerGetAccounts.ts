import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabaseClient";
import { tellerApiRequest } from "@/utils/teller";

type TellerAccount = {
	enrollment_id: string;
	links: {
		balances: string;
		self: string;
		transactions: string;
	};
	institution: {
		name: string;
		id: string;
	};
	type: string;
	name: string;
	subtype: string;
	currency: string;
	id: string;
	last_four: string;
	status: string;
}

const fetchTellerAccounts = async (accessToken: string) => {
	try {
		return await tellerApiRequest("accounts", {
			method: "GET",
			access_token: accessToken,
		});
	} catch (error) {
		console.error("Error fetching Teller accounts:", error);
		throw error;
	}
};

const fetchTellerAccount = async (accessToken: string, accountId: string) => {
	try {
		return await tellerApiRequest(`accounts/${accountId}`, {
			method: "GET",
			access_token: accessToken,
		});
	} catch (error) {
		console.error("Error fetching Teller account details:", error);
		throw error;
	}
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { access_token, account_id, profile_id } = JSON.parse(req.body);

	try {

		// Fetch transactions using tellerApiRequest
		const tellerAccounts : TellerAccount[] = await tellerApiRequest(
			`accounts`,
			{ method: "GET", access_token },
		);

		const formattedAccounts = tellerAccounts.map((account) => ({
			account_id: account.id,
			account_name: account.name,
			account_subtype: account.subtype,
			account_type: account.type,
			enrollment_id: account.enrollment_id,
			last_four: account.last_four,
			profile_id,
		}));

		const accounts = await supabase.from("teller_accounts").upsert(formattedAccounts, { onConflict: "account_id" });

		res.status(200).json(accounts);
	} catch (error: any) {
		console.error("Teller Transactions Error:", error);

		// Handle specific Teller API error scenarios
		res.status(200).json({
			error: {
				error_code: "UNKNOWN_ERROR",
				error_message: error.message,
			},
		});
	}
}
