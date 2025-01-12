// AccountList.tsx
import React from "react";
import * as R from "ramda";
import * as Dialog from "@radix-ui/react-dialog";
import Toggle from "@/components/Toggle";
import { Button } from "@/components/Button";
import { ModalContent } from "@/components/Modal";
import { ExclamationTriangleIcon, ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import { AccountType } from "@/types/store";
import { tempStore } from "@/utils/store";

interface AccountListProps {
	accounts: Record<string, AccountType>;
	showAccounts: string[];
	getTransactions: (access_token: string, account_id: string) => void;
	setShowAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AccountList: React.FC<AccountListProps> = ({ accounts, showAccounts, getTransactions, setShowAccounts }) => {
	const renderAccount = (account: AccountType) => {
		const access_token = tempStore.getState().tellerAuth[account.enrollment_id].access_token;

		if (account.invalid) {
			return (
				<Dialog.Root key={account.account_id}>
					<Dialog.Trigger asChild>
						<div className="grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1">
							<Toggle checked={showAccounts.includes(account.account_id)} />
							<div className="grid grid-cols-[auto_auto] gap-2 items-center place-content-start text-ellipsis overflow-hidden whitespace-nowrap">
								<ExclamationTriangleIcon color={theme.colors.avatar[0]} />
								{account.account_name}
							</div>
							<span className="font-mono font-medium tracking-tight text-gray-500">
                •••• {account.last_four}
              </span>
						</div>
					</Dialog.Trigger>
					<ModalContent>
						<div className="grid grid-cols-1 gap-2 text-center">
							<Dialog.Title className="font-medium text-md">
								Lost connection to payment method
							</Dialog.Title>
							<Dialog.Description className="text-sm text-gray-500">
								To reconnect your payment method, you will need to login to your bank institution via Plaid.
							</Dialog.Description>
						</div>
						<div className="grid grid-cols-1 gap-2">
							<Dialog.Close asChild>
								<Button size="sm" border={theme.colors.gradient.a}>
									<ArrowLeftIcon /> Cancel
								</Button>
							</Dialog.Close>
							<Button
								size="sm"
								background={theme.colors.gradient.a}
								// onClick={() => reauthenticatePlaid(account.access_token, account.account_id)}
							>
								<ExitIcon /> Proceed
							</Button>
						</div>
					</ModalContent>
				</Dialog.Root>
			);
		}

		return (
			<div
				className="grid grid-cols-[auto_1fr_auto] items-center justify-between content-center gap-3 py-1 cursor-pointer"
				onClick={() => getTransactions(access_token, account.account_id)}
				key={account.account_id}
			>
				<Toggle checked={showAccounts.includes(account.account_id)} />
				<div className="text-ellipsis overflow-hidden whitespace-nowrap">
					{account.account_name}
				</div>
				<span className="font-mono font-medium tracking-tight text-gray-500">
          •••• {account.last_four}
        </span>
			</div>
		);
	};

	return (
		<div className="p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-2 text-sm">
			{R.values(accounts).map(renderAccount)}
		</div>
	);
};
