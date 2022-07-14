import type { NextApiRequest, NextApiResponse } from "next";
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
	try {
		const { access_token } = JSON.parse(req.body);

		// use balance endpoint to get additional pm data
		const balance = await client.accountsBalanceGet({ access_token });

		res.status(200).json({ data: balance.data });
	} catch (error) {
		res.status(401).json({ error });
	}
}
