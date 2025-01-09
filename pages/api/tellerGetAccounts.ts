import https from "https";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

// {
// 	"enrollment_id" : "enr_oiin624rqaojse22oe000",
// 	"links" : {
// 	"balances" : "https://api.teller.io/accounts/acc_oiin624kqjrg2mp2ea000/balances",
// 		"self" : "https://api.teller.io/accounts/acc_oiin624kqjrg2mp2ea000",
// 		"transactions" : "https://api.teller.io/accounts/acc_oiin624kqjrg2mp2ea000/transactions"
// },
// 	"institution" : {
// 	"name" : "Security Credit Union",
// 		"id" : "security_cu"
// },
// 	"type" : "credit",
// 	"name" : "Platinum Card",
// 	"subtype" : "credit_card",
// 	"currency" : "USD",
// 	"id" : "acc_oiin624kqjrg2mp2ea000",
// 	"last_four" : "7857",
// 	"status" : "open"
// }

type TellerAccount = {
	enrollment_id: string;
	links: {
		balances: string;
		self: string;
		transactions: string;
	};
	institution: {
		name: string;
		id: string;
	};
	type: string;
	name: string;
	subtype: string;
	currency: string;
	id: string;
	last_four: string;
	status: string;
}

const tellerApiRequest = async (endpoint: string, options: any) => {
	const httpsAgent = new https.Agent({
		cert: fs.readFileSync(process.env.TELLER_CLIENT_CERT_PATH!),
		key: fs.readFileSync(process.env.TELLER_CLIENT_KEY_PATH!),
		rejectUnauthorized: true,
	});

	const requestOptions = {
		...options,
		agent: httpsAgent,
		headers: {
			...options.headers,
			"Authorization": `Basic ${Buffer.from(options.access_token + ":").toString("base64")}`,
			"Content-Type": "application/json",
		},
	};

	const response = await fetch(`https://api.teller.io${endpoint}`, requestOptions);

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(`API Error: ${response.status} - ${errorBody}`);
		throw new Error(`Teller API request failed: ${response.statusText}`);
	}

	return response.json();
};

const fetchTellerAccounts = async (accessToken: string) => {
	try {
		return await tellerApiRequest("/accounts", {
			method: "GET",
			access_token: accessToken,
		});
	} catch (error) {
		console.error("Error fetching Teller accounts:", error);
		throw error;
	}
};

const fetchTellerAccount = async (accessToken: string, accountId: string) => {
	try {
		return await tellerApiRequest(`/accounts/${accountId}`, {
			method: "GET",
			access_token: accessToken,
		});
	} catch (error) {
		console.error("Error fetching Teller account details:", error);
		throw error;
	}
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { access_token, account_id } = JSON.parse(req.body);

	try {
		// Fetch transactions using tellerApiRequest
		const tellerTransactions : TellerAccount = await tellerApiRequest(
			`/accounts`,
			{ method: "GET", access_token },
		);

		res.status(200).json(tellerTransactions);
	} catch (error: any) {
		console.error("Teller Transactions Error:", error);

		// Handle specific Teller API error scenarios
		res.status(200).json({
			error: {
				error_code: "UNKNOWN_ERROR",
				error_message: error.message,
			},
		});
	}
}
