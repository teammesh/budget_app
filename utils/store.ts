import create from "zustand";
import { persist } from "zustand/middleware";
import { GROUP_FEED_MODE } from "@/constants/components.constants";
import { definitions } from "../types/supabase";

interface SessionStoreState {
	session: any;
	setSession: (x: any) => void;
	transactionCursor: Record<string, unknown>;
	setTransactionCursor: (x: any) => void;
	accounts: Record<any, any>;
	setAccounts: (x: any) => void;
}

export const sessionStore = create<SessionStoreState>(
	// @ts-ignore
	persist(
		(set, get) => ({
			session: null,
			setSession: (x) => set(() => ({ session: x })),
			transactionCursor: {},
			setTransactionCursor: (x) => set(() => ({ transactionCursor: x })),
			accounts: {},
			setAccounts: (x) => set(() => ({ accounts: x })),
		}),
		{
			name: "session-store", // name of item in the storage (must be unique)
			getStorage: () => sessionStorage,
		},
	),
);

interface TempStoreState {
	sharedTransactions: any[];
	setSharedTransactions: (x: any[]) => void;
	newTransaction: definitions["shared_transactions"];
	setNewTransaction: (x: definitions["shared_transactions"]) => void;
	filteredTransactions: any[];
	setFilteredTransactions: (x: any[]) => void;
	userPayments: any[];
	setUserPayments: (x: any[]) => void;
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
}

export const tempStore = create<TempStoreState>((set, get) => ({
	addTransactions: [],
	setAddTransactions: (x) => set(() => ({ addTransactions: x })),
	newTransaction: null,
	setNewTransaction: (x) => set(() => ({ newTransaction: x })),
	sharedTransactions: [],
	setSharedTransactions: (x) => set(() => ({ sharedTransactions: x })),
	filteredTransactions: [],
	setFilteredTransactions: (x) => set(() => ({ filteredTransactions: x })),
	userPayments: [],
	setUserPayments: (x) => set(() => ({ userPayments: x })),
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

interface UIStoreState {
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
}

export const uiStore = create<UIStoreState>((set, get) => ({
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
