// services/transactionService.ts
import { supabase } from "@/utils/supabaseClient";
import { tempStore } from "@/utils/store";
import * as R from "ramda";
import { definitions } from "@/types/supabase";
import {
	TRANSACTION_METADATA,
	TRANSACTION_PAGINATION_COUNT,
} from "@/constants/components.constants";
import { sortByDate } from "@/utils/helper";

export const getTransactions = async (
	access_token: definitions["plaid_items"]["access_token"],
	account_id: definitions["plaid_items"]["account_id"],
) => {
	const profile_id = supabase.auth.session()?.user?.id;
	const setUserTransactions = tempStore.getState().setUserTransactions;
	const updateTransactionPagination = tempStore.getState().updateTransactionPagination;

	const paginateDate = (date: string): string => {
		const newDate = new Date(date.replaceAll("-", "/"));
		const month = newDate.getMonth() - 6;

		if (month < 0) {
			newDate.setFullYear(newDate.getFullYear() - 1);
			newDate.setMonth(11 - Math.abs(month));
		} else {
			newDate.setMonth(month);
		}

		newDate.setHours(0, 0, 0, 0);
		return getFormattedDate(newDate);
	};

	const getFormattedDate = (date: Date): string => {
		return date
			.toLocaleDateString("en-ZA", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.replaceAll("/", "-");
	};

	const pagination = tempStore.getState().transactionPagination[account_id] || {
		start_date: paginateDate(getFormattedDate(new Date())),
		end_date: getFormattedDate(new Date()),
		offset: 0,
	};

	if (pagination?.reached_limit) return;

	let allTransactions = tempStore.getState().userTransactions;

	const tellerTransactions = await fetch("/api/tellerGetTransactions", {
		method: "POST",
		body: JSON.stringify({
			access_token,
			account_id,
			start_date: pagination.start_date,
			end_date: pagination.end_date,
			offset: pagination.offset,
			count: TRANSACTION_PAGINATION_COUNT,
		}),
	}).then((res) => res.json());

	if (tellerTransactions.total_transactions === 0) {
		updateTransactionPagination({
			[account_id]: {
				...pagination,
				reached_limit: true,
			},
		});
	} else {
		updateTransactionPagination({
			[account_id]: {
				start_date: paginateDate(pagination.start_date),
				end_date: paginateDate(pagination.end_date),
				offset: 0,
			},
		});
	}

	if (!R.isEmpty(tellerTransactions.transactions)) {
		const newTellerTransactions = R.map(
			(x) => R.assocPath(
				["profile_id"],
				profile_id || null,
				R.pick(TRANSACTION_METADATA, x),
			),
			tellerTransactions.transactions,
		);

		const mergeTransactions = R.concat(R.values(allTransactions), newTellerTransactions as any);
		const sortTransactions = R.reverse(sortByDate(mergeTransactions));

		allTransactions = R.indexBy(R.prop("transaction_id"), sortTransactions);
	}

	// console.log(allTransactions);
	setUserTransactions(allTransactions);
	return allTransactions;
};
