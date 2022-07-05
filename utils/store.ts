import create from "zustand";
import { persist } from "zustand/middleware";

interface SessionStoreState {
	session: any;
	setSession: (x: any) => void;
	profile: any;
	setProfile: (x: any) => void;
	transactions: any;
	setTransactions: (x: any) => void;
	transactionCursor: Record<string, unknown>;
	setTransactionCursor: (x: any) => void;
	accounts: any[];
	setAccounts: (x: any[]) => void;
}

export const sessionStore = create<SessionStoreState>(
	persist(
		(set, get) => ({
			session: {},
			setSession: (x) => set(() => ({ session: x })),
			profile: {},
			setProfile: (x) => set(() => ({ profile: x })),
			transactions: [],
			setTransactions: (x) => set(() => ({ transactions: x })),
			transactionCursor: null,
			setTransactionCursor: (x) => set(() => ({ transactionCursor: x })),
			accounts: [],
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
	groups: any[];
	setGroups: (x: any[]) => void;
}

export const tempStore = create<TempStoreState>((set, get) => ({
	sharedTransactions: [],
	setSharedTransactions: (x) => set(() => ({ sharedTransactions: x })),
	groups: [],
	setGroups: (x) => set(() => ({ groups: x })),
}));
