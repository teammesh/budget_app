import create from "zustand";
import { persist } from "zustand/middleware";
import { GROUP_FEED_MODE } from "@/constants/components.constants";
import * as R from "ramda";
import { StoreType } from "../types/store";

export const sessionStore = create<StoreType["sessionStore"]>(
	// @ts-ignore
	persist(
		(set, get) => ({
			session: null,
			setSession: (x) => set(() => ({ session: x })),
			accountPagination: {},
			updateAccountPagination: (x) =>
				set(() => ({ accountPagination: R.mergeDeepRight(get().accountPagination, x) })),
			setAccountPagination: (x) => set(() => ({ accountPagination: x })),
			plaidReturnToUrl: "",
			setPlaidReturnToUrl: (x) => set(() => ({ plaidReturnToUrl: x })),
			plaidReceivedRedirectUri: "",
			setPlaidReceivedRedirectUri: (x) => set(() => ({ plaidReceivedRedirectUri: x })),
		}),
		{
			name: "session-store", // name of item in the storage (must be unique)
			getStorage: () => sessionStorage,
		},
	),
);

export const tempStore = create<StoreType["tempStore"]>((set, get) => ({
	accounts: {},
	setAccounts: (x) => set(() => ({ accounts: x })),
	userTransactions: {},
	setUserTransactions: (x) => set(() => ({ userTransactions: x })),
	updateUserTransactions: (x) =>
		// @ts-ignore
		set(() => ({ userTransactions: R.mergeDeepRight(get().userTransactions, x) })),
	transactionPagination: {},
	setTransactionPagination: (x) => set(() => ({ transactionPagination: x })),
	updateTransactionPagination: (x) =>
		// @ts-ignore
		set(() => ({ transactionPagination: R.mergeDeepRight(get().transactionPagination, x) })),
	addTransactions: [],
	setAddTransactions: (x) => set(() => ({ addTransactions: x })),
	newTransaction: {},
	setNewTransaction: (x) => set(() => ({ newTransaction: x })),
	sharedTransactions: {},
	setSharedTransactions: (x) => set(() => ({ sharedTransactions: x })),
	updateSharedTransactions: (x) =>
		// @ts-ignore
		set(() => ({ sharedTransactions: R.mergeDeepRight(get().sharedTransactions, x) })),
	filteredTransactions: [],
	setFilteredTransactions: (x) => set(() => ({ filteredTransactions: x })),
	userPayments: {},
	setUserPayments: (x) => set(() => ({ userPayments: x })),
	balances: [],
	setBalances: (x) => set(() => ({ balances: x })),
	groupActivities: [],
	setGroupActivities: (x) => set(() => ({ groupActivities: x })),
	groups: [],
	setGroups: (x) => set(() => ({ groups: x })),
	groupName: "",
	setGroupName: (x) => set(() => ({ groupName: x })),
	groupMembers: null,
	setGroupMembers: (x) => set(() => ({ groupMembers: x })),
	username: "",
	setUsername: (x) => set(() => ({ username: x })),
	website: "",
	setWebsite: (x) => set(() => ({ website: x })),
	avatarUrl: "",
	setAvatarUrl: (x) => set(() => ({ avatarUrl: x })),
	groupAvatarUrl: "",
	setGroupAvatarUrl: (x) => set(() => ({ groupAvatarUrl: x })),
	linkToken: "",
	setLinkToken: (x) => set(() => ({ linkToken: x })),
}));

export const uiStore = create<StoreType["uiStore"]>((set, get) => ({
	showNavbar: true,
	setShowNavbar: (x) => set(() => ({ showNavbar: x })),
	globalLoading: false,
	setGlobalLoading: (x) => set(() => ({ globalLoading: x })),
	showAddTransactions: false,
	setShowAddTransactions: (x) => set(() => ({ showAddTransactions: x })),
	showAddManualTransactions: false,
	setShowAddManualTransactions: (x) => set(() => ({ showAddManualTransactions: x })),
	showPayments: false,
	setShowPayments: (x) => set(() => ({ showPayments: x })),
	showManage: false,
	setShowManage: (x) => set(() => ({ showManage: x })),
	groupFeedMode: GROUP_FEED_MODE.activity,
	setGroupFeedMode: (x) => set(() => ({ groupFeedMode: x })),
	groupFilterbyUser: null,
	setGroupFilterbyUser: (x) => set(() => ({ groupFilterbyUser: x })),
	showSessionExpired: false,
	setShowSessionExpired: (x) => set(() => ({ showSessionExpired: x })),
	showAddTransactionSuccess: false,
	setShowAddTransactionSuccess: (x) => set(() => ({ showAddTransactionSuccess: x })),
}));
