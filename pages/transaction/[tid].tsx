import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Transaction as TransactionType } from "plaid";

const Transaction = () => {
	const router = useRouter();
	// @ts-ignore
	const { tid }: { tid: string } = router.query;

	const [transaction, setTransaction] = useState<TransactionType | Record<any, any>>({});
	const [groupUsers, setGroupUsers] = useState([]);

	useEffect(() => {
		if (!tid) return;
		// get users of a shared transaction
		supabase
			.from("shared_transactions")
			.select("*, groups( name, profiles_groups( profiles(id, username) ) )")
			.eq("id", tid)
			.then(({ data }) => {
				if (!data || data.length === 0) return;
				setTransaction(data[0]);
				setGroupUsers(data[0].groups.profiles_groups);
			});
	}, [tid]);

	return (
		<div>
			<p>Transaction: {tid}</p>
			<div className={"grid grid-cols-4"}>
				<div>{transaction.date}</div>
				<div>{transaction.merchant_name}</div>
				<div>{transaction.name}</div>
				<div>{transaction.amount}</div>
			</div>
			<div> {transaction.category}</div>
			<div>
				{groupUsers.map((user: any) => (
					<div key={user.profiles.profile_id}>{user.profiles.username}</div>
				))}
			</div>
		</div>
	);
};

export default Transaction;
