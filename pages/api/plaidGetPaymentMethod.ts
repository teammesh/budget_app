import type { NextApiRequest, NextApiResponse } from "next";
import { AuthGetRequest } from "plaid";

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
	const { access_token } = JSON.parse(req.body);

	const request: AuthGetRequest = {
		access_token,
	};

	const response = await client.authGet(request);

	res.status(200).json(response);
}
