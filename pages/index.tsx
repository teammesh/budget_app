import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Auth from "@/components/Auth";
import Groups from "@/pages/groups";

export default function Home() {
	const [session, setSession] = useState(null);

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	return (
		<div className="md:container md:mx-auto md:max-w-2xl pt-20">
			{/* {!session ? <Auth /> : <Account key={session.user.id} session={session} />} */}
			{!session ? <Auth /> : <Groups />}
		</div>
	);
}
