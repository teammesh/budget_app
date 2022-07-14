import type { NextApiRequest, NextApiResponse } from "next";
import { TransactionsSyncRequest } from "plaid";

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

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
	const { access_token, cursor } = JSON.parse(req.body);

	const request: TransactionsSyncRequest = {
		access_token,
		cursor,
	};
	try {
		const response = await client.transactionsSync(request);
		const data = response.data;
		res.status(200).json(data);
	} catch (error: any) {
		// if (error.response.data.error_code === "ITEM_LOGIN_REQUIRED") {}
		res.status(400).json({ error: { ...error.response.data } });
	}
}
