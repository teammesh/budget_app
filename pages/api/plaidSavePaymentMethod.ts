import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
// @ts-ignore
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

const configuration = new Configuration({
	// @ts-ignore
	basePath: PlaidEnvironments[process.env.PLAID_ENV],
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
			"PLAID-SECRET": process.env.PLAID_SECRET,
			"Plaid-Version": "2020-09-14",
		},
	},
});

const client = new PlaidApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { access_token, item_id, profile_id } = JSON.parse(req.body);

		// use balance endpoint to get additional pm data
		const balance = await client.accountsBalanceGet({ access_token });

		const { data, error } = await supabaseService.from("plaid_items").insert({
			profile_id,
			access_token,
			item_id,
			account_id: balance.data.accounts[0].account_id,
			last_four_digits: balance.data.accounts[0].mask,
			name: balance.data.accounts[0].name,
		});

		res.status(200).json({ data, error });
	} catch (error) {
		res.status(401).json({ error });
	}
}
