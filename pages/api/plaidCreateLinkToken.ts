import type { NextApiRequest, NextApiResponse } from "next";

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

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
	const { profile_id } = JSON.parse(req.body);

	const request = {
		user: {
			client_user_id: profile_id,
		},
		client_name: "budget_app",
		products: ["transactions"],
		language: "en",
		// webhook: "https://webhook.example.com",
		// redirect_uri: "https://domainname.com/oauth-page.html",
		country_codes: ["US"],
	};

	const response = await client.linkTokenCreate(request);
	res.status(200).json(response.data.link_token);
}
