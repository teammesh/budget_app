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
	const { profile_id, access_token } = JSON.parse(req.body);

	const request = {
		user: {
			client_user_id: profile_id,
		},
		client_name: "budget_app",
		products: access_token ? [] : ["transactions"],
		language: "en",
		// webhook: "https://webhook.example.com",
		// redirect_uri: "https://domainname.com/oauth-page.html",
		country_codes: ["US"],
		access_token,
	};

	const response = await client.linkTokenCreate(request);
	res.status(200).json(response.data.link_token);
}
