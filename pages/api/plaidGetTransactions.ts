import type { NextApiRequest, NextApiResponse } from "next";
import { TransactionsGetRequest } from "plaid";
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
	const { access_token, start_date, end_date, offset, count } = JSON.parse(req.body);

	const request: TransactionsGetRequest = {
		access_token,
		start_date,
		end_date,
		options: {
			count: count || 50,
			offset: offset || 0,
		},
	};

	try {
		const response = await client.transactionsGet(request);
		const data = response.data;

		// await supabaseService
		// 	.from("plaid_items")
		// 	.update({
		// 		cursor: data.next_cursor,
		// 	})
		// 	.eq("access_token", access_token);

		console.log(data);
		res.status(200).json(data);
	} catch (error: any) {
		// if (error.response.data.error_code === "ITEM_LOGIN_REQUIRED") {}
		res.status(400).json({ error: { ...error.response.data } });
	}
}
