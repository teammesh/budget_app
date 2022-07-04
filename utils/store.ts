import create from "zustand";
import { persist } from "zustand/middleware";

interface SessionStoreState {
	transactions: [];
	setTransactions: (x: []) => void;
	transactionCursor: string | null;
	setTransactionCursor: (x: string) => void;
	accounts: [];
	setAccounts: (x: []) => void;
}

export const sessionStore = create<SessionStoreState>(
	persist(
		(set, get) => ({
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
