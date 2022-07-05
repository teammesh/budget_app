import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@chakra-ui/react";
import AddTransactions from "@/components/AddTransactions";

const Group = () => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;

	const [showAddTransactions, setShowAddTransactions] = useState(false);
	const [sharedTransactions, setSharedTransactions] = useState([]);

	useEffect(() => {
		if (!gid) return;
		supabase
			.from("shared_transactions")
			.select()
			.eq("group_id", gid)
			.then(({ data, error }) => setSharedTransactions(data));

		supabase
			.from(`shared_transactions:group_id=eq.${gid}`)
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
			<Button onClick={addTransactions}>Add transactions</Button>
			{showAddTransactions && <AddTransactions gid={gid} />}
		</div>
	);
};

export default Group;
