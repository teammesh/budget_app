import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@chakra-ui/react";
import AddTransactions from "@/components/AddTransactions";
import { isEmpty } from "ramda";
import { Transaction } from "plaid";

const Group = () => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;

	const [showAddTransactions, setShowAddTransactions] = useState(false);
	const [sharedTransactions, setSharedTransactions] = useState<any[]>([]);

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
			<div className={"text-lg font-semibold"}>Shared transactions {sharedTransactions.length}</div>
			{!isEmpty(sharedTransactions) &&
				sharedTransactions.map((x: Transaction) => (
					<div key={x.transaction_id} className={"grid grid-cols-4"}>
						<div>{x.date}</div>
						<div>{x.merchant_name}</div>
						<div>{x.name}</div>
						<div>{x.amount}</div>
					</div>
				))}

			<Button onClick={addTransactions}>Add transactions</Button>
			{showAddTransactions && (
				<AddTransactions
					gid={gid}
					sharedTransactions={sharedTransactions}
					setSharedTransactions={setSharedTransactions}
				/>
			)}
		</div>
	);
};

export default Group;
