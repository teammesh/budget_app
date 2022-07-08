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
	const { public_token, profile_id } = JSON.parse(req.body);

	const response = await client.itemPublicTokenExchange({
		public_token,
	});
	const accessToken = response.data.access_token;
	const itemID = response.data.item_id;

	// use balance endpoint to get additional pm data
	const balance = await client.accountsBalanceGet({ access_token: accessToken });

	const { data, error } = await supabaseService.from("plaid_items").insert({
		profile_id,
		access_token: accessToken,
		item_id: itemID,
		account_id: balance.data.accounts[0].account_id,
		last_four_digits: balance.data.accounts[0].mask,
		name: balance.data.accounts[0].name,
	});

	res.status(200).json({ data, error });
}
