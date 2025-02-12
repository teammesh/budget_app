// AddTransactions.tsx
import React, { useEffect, useState } from "react";
import { tempStore, uiStore } from "@/utils/store";
import * as R from "ramda";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Header, TextGradient } from "@/components/text";
import { Loading } from "@/components/Loading";
import { Content } from "@/components/Main";

import { fetchAccounts } from "@/services/accountService";
import { getTransactions } from "@/services/transactionService";
import { AccountList } from "@/components/AddTransactions/AccountList";
import { TransactionToolbar } from "@/components/AddTransactions/TransactionToolbar";
import { Transaction } from "@/components/Transaction";
import { TellerConnect } from "@/components/tellerConnect";
import { fetchTellerAuth } from "@/services/tellerAuthService";

export default function AddTransactions({ gid, setShowAddTransactions, groupUsers }: {
	gid: string;
	setShowAddTransactions: (show: boolean) => void;
	groupUsers: any;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const showAccounts = uiStore((state) => state.showAccounts);
	const setShowAccounts = uiStore.getState().setShowAccounts;

	const userTransactions = tempStore((state) => state.userTransactions);
	const accounts = tempStore((state) => state.accounts);

	useEffect(() => {
		const initializeAccounts = async () => {
			await fetchTellerAuth();
			await fetchAccounts();
			setIsLoading(false);
		};

		initializeAccounts();
	}, []);

	const handleGetTransactions = async (access_token: string, account_id: string) => {
		if (showAccounts.includes(account_id)) {
			setShowAccounts(R.without([account_id], showAccounts));
		} else {
			await getTransactions(access_token, account_id);
			setShowAccounts(R.append(account_id, showAccounts));
		}
	};

	return (
		<>
			<Content id="transactions">
				<div className="flex justify-between">
					<Button
						size="sm"
						style={{ background: theme.colors.gradient.a }}
						onClick={() => {
							setShowAddTransactions(false);
							tempStore.getState().setAddTransactions([]);
						}}
					>
						<ArrowLeftIcon /> Cancel
					</Button>
					<TellerConnect/>
				</div>

				<AccountList
					accounts={accounts}
					showAccounts={showAccounts}
					getTransactions={handleGetTransactions}
				/>

				<div className="mt-6">
					<Header>
						Your <TextGradient gradient={theme.colors.gradient.a}>transactions</TextGradient>
					</Header>

					<div className="grid grid-cols-1 gap-2">
						{!R.isEmpty(userTransactions) &&
							R.values(userTransactions).map(
								(transaction) =>
									showAccounts.includes(transaction.account_id) && (
										<Transaction
											gid={gid}
											transaction={transaction}
											key={transaction.transaction_id}
											groupUsers={groupUsers}
										/>
									),
							)
						}
					</div>
				</div>

				{isLoading && <Loading />}
			</Content>

			<TransactionToolbar />
		</>
	);
}
