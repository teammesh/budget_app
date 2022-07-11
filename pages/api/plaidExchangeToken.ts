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
		const { public_token } = JSON.parse(req.body);

		const response = await client.itemPublicTokenExchange({
			public_token,
		});
		const accessToken = response.data.access_token;
		const itemID = response.data.item_id;

		res.status(200).json({ item_id: itemID, access_token: accessToken });
	} catch (error) {
		res.status(401).json({ error });
	}
}
