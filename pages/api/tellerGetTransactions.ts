import type { NextApiRequest, NextApiResponse } from "next";
import { tellerApiRequest } from "@/utils/teller";

type TellerTransaction = {
	running_balance: number | null;
	details: {
		category: string;
		counterparty: {
			type: string;
			name: string;
		};
		processing_status: string;
	};
	description: string;
	account_id: string;
	date: string;
	id: string;
	links: {
		account: string;
		self: string;
	};
	amount: string;
	type: string;
	status: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { access_token, account_id, start_date, end_date, offset, count } = JSON.parse(req.body);

	try {
		// Fetch transactions using tellerApiRequest
		const tellerTransactions : TellerTransaction[] = await tellerApiRequest(
			`/accounts/${account_id}/transactions`,
			{
				method: "GET",
				access_token,
				body: JSON.stringify({
					count,
				}),
			},
		);

		// {
		// 	"running_balance" : null,
		// 	"details" : {
		// 	"category" : "service",
		// 		"counterparty" : {
		// 		"type" : "organization",
		// 			"name" : "CARDTRONICS"
		// 	},
		// 	"processing_status" : "complete"
		// },
		// 	"description" : "ATM Withdrawal",
		// 	"account_id" : "acc_oiin624kqjrg2mp2ea000",
		// 	"date" : "2023-07-13",
		// 	"id" : "txn_oiluj93igokseo0i3a005",
		// 	"links" : {
		// 	"account" : "https://api.teller.io/accounts/acc_oiin624kqjrg2mp2ea000",
		// 		"self" : "https://api.teller.io/accounts/acc_oiin624kqjrg2mp2ea000/transactions/txn_oiluj93igokseo0i3a005"
		// },
		// 	"amount" : "42.47",
		// 	"type" : "atm",
		// 	"status" : "posted"
		// },

		// Transform Teller transactions to match expected structure
		const transformedTransactions = tellerTransactions.map((transaction) => ({
			transaction_id: transaction.id,
			account_id: transaction.account_id,
			amount: Math.abs(parseFloat(transaction.amount)),
			date: transaction.date,
			name: transaction.description,
			merchant_name: transaction.details?.counterparty?.name || transaction.description,
			category: transaction.details?.category ? [transaction.details.category] : [],
			pending: transaction.status === "pending",
			transaction_type: transaction.type,
			description: transaction.description,
		}));

		// Prepare response similar to previous implementation
		const response = {
			transactions: transformedTransactions,
			total_transactions: transformedTransactions.length,
			error: null,
		};

		res.status(200).json(response);
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
