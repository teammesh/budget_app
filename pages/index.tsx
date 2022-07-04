import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import { PlaidLink } from "@/components/PlaidLink";
import { sessionStore } from "@/utils/store";

export default function Home() {
	const [session, setSession] = useState(null);
	const transactions = sessionStore((state) => state.transactions);
	const setTransactions = sessionStore.getState().setTransactions;

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		supabase
			.from("plaid_items")
			.select()
			.eq("profile_id", supabase.auth.session()?.user?.id)
			.then(({ data, error }) => setTransactions(data));
	}, []);

	return (
		<div className="container" style={{ padding: "50px 0 100px 0" }}>
			{!session ? <Auth /> : <Account key={session.user.id} session={session} />}
			<PlaidLink />
			{transactions.map((x) => (
				<div>{x.item_id}</div>
			))}
		</div>
	);
}
