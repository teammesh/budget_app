import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { Button } from "@chakra-ui/react";
import AddTransactions from "@/components/AddTransactions";
import { isEmpty } from "ramda";
import { Transaction } from "plaid";
import { tempStore } from "@/utils/store";
import Link from "next/link";

const Group = () => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;

	const [showAddTransactions, setShowAddTransactions] = useState(false);
	const [groupUsers, setGroupUsers] = useState([]);
	const sharedTransactions = tempStore((state) => state.sharedTransactions);
	const setSharedTransactions = tempStore.getState().setSharedTransactions;

	useEffect(() => {
		setSharedTransactions([]);
		if (!gid) return;
		supabase
			.from("shared_transactions")
			.select()
			.eq("group_id", gid)
			.then(({ data, error }) => setSharedTransactions(data));

		// subscribe to shared_transactions table based on group_id
		supabase
			.from(`shared_transactions:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				setSharedTransactions([...tempStore.getState().sharedTransactions, payload.new]);
			})
			.subscribe();

		// subscribe to user changes in this group
		supabase
			.from(`profiles_groups:group_id=eq.${gid}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				fetchGroupUsers();
			})
			.subscribe();

		fetchGroupUsers();
		return () => setSharedTransactions([]);
	}, [gid]);

	const fetchGroupUsers = async () => {
		const { data } = await supabaseQuery(
			() =>
				supabase
					.from("profiles_groups")
					.select("profile_id, profiles(username)")
					.eq("group_id", gid),
			true,
		);

		setGroupUsers(data);
	};

	const addTransactions = () => {
		setShowAddTransactions(true);
	};

	return (
		<div>
			<p>Group: {gid}</p>
			<div>
				{groupUsers.map((user) => (
					<div key={user.profile_id}>{user.profiles.username}</div>
				))}
			</div>
			<div className={"text-lg font-semibold"}>Shared transactions {sharedTransactions.length}</div>
			{!isEmpty(sharedTransactions) &&
				sharedTransactions.map((x: Transaction) => (
					<Link href={`/transaction/${encodeURIComponent(x.id)}`} key={x.id}>
						<div className={"grid grid-cols-4"}>
							<div>{x.date}</div>
							<div>{x.merchant_name}</div>
							<div>{x.name}</div>
							<div>{x.amount}</div>
						</div>
					</Link>
				))}

			<Button onClick={addTransactions}>Add transactions</Button>
			{showAddTransactions && <AddTransactions gid={gid} sharedTransactions={sharedTransactions} />}
		</div>
	);
};

export default Group;
