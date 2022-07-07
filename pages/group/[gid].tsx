import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import AddTransactions from "@/components/AddTransactions";
import { isEmpty } from "ramda";
import { Transaction } from "plaid";
import { tempStore } from "@/utils/store";
import Link from "next/link";
import { verifyUser } from "@/utils/ssr";
import { Main } from "@/components/Main";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { ArrowLeftIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";

const Group = ({ user, profile, transactions, users }) => {
	const router = useRouter();
	const { gid }: { gid: string } = router.query;
	const [showAddTransactions, setShowAddTransactions] = useState(false);
	const [groupUsers, setGroupUsers] = useState(users);
	const sharedTransactions = tempStore((state) => state.sharedTransactions);
	const setSharedTransactions = tempStore.getState().setSharedTransactions;
	const groupName = users[0].groups.name;

	useEffect(() => {
		setSharedTransactions(transactions);
	}, []);

	useEffect(() => {
		if (!gid) return;

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
		<Main>
			<Navbar />
			<div>{groupName}</div>
			<div className={"flex justify-between"}>
				<Button size={"sm"} style={{ background: theme.colors.gradient.a }}>
					<ArrowLeftIcon />
					Return
				</Button>
				<Button size={"sm"} style={{ background: theme.colors.gradient.a }}>
					<MixerHorizontalIcon />
					Manage
				</Button>
			</div>
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

			<button onClick={addTransactions}>Add transactions</button>
			{showAddTransactions && <AddTransactions gid={gid} sharedTransactions={sharedTransactions} />}
		</Main>
	);
};

export async function getServerSideProps({ req }) {
	const { props, redirect } = await verifyUser(req);

	const gidRegEx = new RegExp("(?<=gid=).*");
	const result = gidRegEx.exec(req.url);

	const gid = result ? result[0] : req.url.toString().slice(7);
	const { data: transactions } = await supabase
		.from("shared_transactions")
		.select()
		.eq("group_id", gid);

	const { data: users } = await supabase
		.from("profiles_groups")
		.select("profile_id, profiles(username), groups(name)")
		.eq("group_id", gid);

	return { props: { ...props, transactions, users }, redirect };
}

export default Group;
