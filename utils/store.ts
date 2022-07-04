import create from "zustand";
import { persist } from "zustand/middleware";

interface SessionStoreState {
	transactions: [];
	setTransactions: (x: []) => void;
}

export const sessionStore = create<SessionStoreState>(
	persist(
		(set, get) => ({
			transactions: [],
			setTransactions: (x) => set(() => ({ transactions: x })),
		}),
		{
			name: "session-store", // name of item in the storage (must be unique)
			getStorage: () => sessionStorage,
		},
	),
);
