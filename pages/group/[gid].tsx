import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";
import { Button } from "@chakra-ui/react";

const Group = () => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;

	const [showAddTransactions, setShowAddTransactions] = useState(false);
	const transactions = sessionStore((state) => state.transactions);
	const setTransactions = sessionStore.getState().setTransactions;

	useEffect(() => {
		if (!gid) return;
		supabase
			.from("marked_transactions")
			.select()
			.eq("group_id", gid)
			.then(({ data, error }) => setTransactions({ ...transactions, [gid]: data }));

		supabase
			.from(`marked_transactions:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
			})
			.subscribe();
	}, [gid]);

	const addTransactions = () => {
		setShowAddTransactions(true);
	};

	return (
		<div>
			<p>Group: {gid}</p>
			<Button>Add transactions</Button>
		</div>
	);
};

export default Group;
