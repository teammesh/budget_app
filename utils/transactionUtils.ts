// utils/transactionUtils.ts
import * as R from "ramda";
import { definitions } from "@/types/supabase";
import { sortByDate } from "./helper";
import { supabase } from "@/utils/supabaseClient";
import { TRANSACTION_METADATA } from "@/constants/components.constants";
import { tempStore } from "@/utils/store";

export const processTransactions = (
	transactions: any[],
	account_id: definitions["plaid_items"]["account_id"],
) => {
	const profile_id = supabase.auth.session()?.user?.id;

	if (R.isEmpty(transactions)) return {};

	const processedTransactions = R.map(
		(transaction) => R.assocPath(
			["profile_id"],
			profile_id || null,
			R.pick(TRANSACTION_METADATA, transaction),
		),
		transactions,
	);

	const mergedTransactions = R.concat(
		R.values(tempStore.getState().userTransactions),
		processedTransactions as any,
	);

	const sortedTransactions = R.reverse(sortByDate(mergedTransactions));

	return R.indexBy(R.prop("transaction_id"), sortedTransactions);
};

export const filterTransactionsByAccount = (
	transactions: Record<string, any>,
	accountIds: string[],
) => {
	return R.filter(
		(transaction) => accountIds.includes(transaction.account_id),
		R.values(transactions),
	);
};

export const calculateTransactionTotal = (transactions: any[]) => {
	return transactions.reduce((total, transaction) => {
		return transaction.amount ? total + transaction.amount : total;
	}, 0);
};
