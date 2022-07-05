import { useRouter } from "next/router";
import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";

const Group = () => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;
	const transactions = sessionStore((state) => state.transactions);
	const setTransactions = sessionStore.getState().setTransactions;

	useEffect(() => {
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
	}, []);

	return <p>Group: {gid}</p>;
};

export default Group;
