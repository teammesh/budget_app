import { definitions } from "./supabase";

export interface StoreType {
	sessionStore: {
		session: any;
		setSession: (x: any) => void;
		userTransactions: Record<string, definitions["shared_transactions"]>;
		setUserTransactions: (x: Record<string, definitions["shared_transactions"]>) => void;
		updateUserTransactions: (x: Record<string, definitions["shared_transactions"]>) => void;
		accountPagination: Record<string, StoreType["accountPagination"]>;
		setAccountPagination: (x: Record<string, StoreType["accountPagination"]>) => void;
		updateAccountPagination: (x: Record<string, StoreType["accountPagination"]>) => void;
	};
	tempStore: {
		accounts: Record<string, AccountType>;
		setAccounts: (x: Record<string, AccountType>) => void;
		sharedTransactions: Record<string, definitions["shared_transactions"]>;
		setSharedTransactions: (x: Record<string, definitions["shared_transactions"]>) => void;
		updateSharedTransactions: (x: Record<string, definitions["shared_transactions"]>) => void;
		newTransaction: definitions["shared_transactions"] | Record<any, any>;
		setNewTransaction: (x: definitions["shared_transactions"] | Record<any, any>) => void;
		filteredTransactions: [definitions["shared_transactions"]] | any[];
		setFilteredTransactions: (x: [definitions["shared_transactions"]] | any[]) => void;
		userPayments: Record<any, any>;
		setUserPayments: (x: Record<any, any>) => void;
		addTransactions: any[];
		setAddTransactions: (x: any[]) => void;
		groupActivities: any[];
		setGroupActivities: (x: any[]) => void;
		groups: any[];
		setGroups: (x: any[]) => void;
		groupName: string;
		setGroupName: (x: string) => void;
		groupMembers: any;
		setGroupMembers: (x: any) => void;
		username: string;
		setUsername: (x: string) => void;
		website: string;
		setWebsite: (x: string) => void;
		avatarUrl: string;
		setAvatarUrl: (x: string) => void;
		groupAvatarUrl: string;
		setGroupAvatarUrl: (x: string) => void;
		linkToken: string;
		setLinkToken: (x: string) => void;
	};
	uiStore: {
		showNavbar: boolean;
		setShowNavbar: (x: boolean) => void;
		globalLoading: boolean;
		setGlobalLoading: (x: boolean) => void;
		showAddTransactions: boolean;
		setShowAddTransactions: (x: boolean) => void;
		showAddManualTransactions: boolean;
		setShowAddManualTransactions: (x: boolean) => void;
		showPayments: boolean;
		setShowPayments: (x: boolean) => void;
		showManage: boolean;
		setShowManage: (x: boolean) => void;
		groupFeedMode: any;
		setGroupFeedMode: (x: any) => void;
		groupFilterbyUser: any;
		setGroupFilterbyUser: (x: any) => void;
		showSessionExpired: boolean;
		setShowSessionExpired: (x: boolean) => void;
		showAddTransactionSuccess: boolean;
		setShowAddTransactionSuccess: (x: boolean) => void;
	};
	accountPagination: {
		cursor: string | null;
		offset: number;
	};
}

export type AccountType = definitions["plaid_items"] & {
	invalid?: boolean;
};
