import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { TransactionsSyncRequest } from "plaid";
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

const configuration = new Configuration({
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
	const { access_token, transactionCursor } = JSON.parse(req.body);

	const request: TransactionsSyncRequest = {
		access_token,
		cursor: transactionCursor,
	};
	const response = await client.transactionsSync(request);
	const data = response.data;

	res.status(200).json(data);
}
