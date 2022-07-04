import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import { PlaidLink } from "@/components/PlaidLink";
import { sessionStore } from "@/utils/store";
import Transactions from "@/pages/transactions";

export default function Home() {
	const [session, setSession] = useState(null);

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	return (
		<div className="container" style={{ padding: "50px 0 100px 0" }}>
			{!session ? <Auth /> : <Account key={session.user.id} session={session} />}
			{session && <Transactions />}
			{session && <PlaidLink />}
		</div>
	);
}
