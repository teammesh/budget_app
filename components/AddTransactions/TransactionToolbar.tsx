// TransactionToolbar.tsx
import React from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/Button";
import { tempStore, uiStore } from "@/utils/store";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { displayAmount } from "@/components/Amount";
import theme from "@/styles/theme";
import * as R from "ramda";
import { definitions } from "@/types/supabase";

export const TransactionToolbar: React.FC = () => {
	const addTransactions = tempStore((state) => state.addTransactions);

	const onAddTransactions = async () => {
		if (addTransactions.length === 0) return;

		const { data } = await supabaseQuery(
			() => supabase
				.from("shared_transactions")
				.upsert(tempStore.getState().addTransactions)
				.select("*, profiles(username, avatar_url)"),
			true,
		);

		const indexedData: Record<string, definitions["shared_transactions"]> = R.indexBy(
			R.prop("id"),
			data,
		);

		tempStore.getState().updateSharedTransactions(indexedData);
		uiStore.getState().setShowAddTransactions(false);
		tempStore.getState().setAddTransactions([]);
	};

	return (
		<div className="grid grid-cols-[auto_1fr] justify-center gap-8 pt-3 px-3">
			<div className="grid grid-cols-1 gap-1">
				<div className="font-mono tracking-tighter text-sm">Total transaction:</div>
				<div className="text-xl tracking-tight leading-none">
					{addTransactions.length === 0
						? "--"
						: displayAmount(
							addTransactions.reduce((prev, curr) => {
								if (!curr.amount) return prev;
								return curr.amount + prev;
							}, 0),
						)
					}
				</div>
			</div>
			<Button
				size="sm"
				background={theme.colors.gradient.a}
				onClick={onAddTransactions}
			>
				<PlusIcon /> Add {addTransactions.length} transactions
			</Button>
		</div>
	);
};
