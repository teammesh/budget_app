import { Main } from "@/components/Main";
import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";
import { sessionStore } from "@/utils/store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { RequestData } from "next/dist/server/web/types";
import { AuthUser } from "@supabase/supabase-js";

export default function Login({ user }: { user: AuthUser }) {
	const router = useRouter();
	const { user: authUser, session } = Auth.useUser();
	const setSession = sessionStore.getState().setSession;

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);

			fetch("/api/auth", {
				method: "POST",
				headers: new Headers({ "Content-Type": "application/json" }),
				credentials: "same-origin",
				body: JSON.stringify({ event, session }),
			}).then((res) => res.json());

			if (event === "SIGNED_IN") router.push("/");
		});

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (user) router.push("/");
		else signOut();
	}, [user]);

	const signOut = async () => {
		if (!session) return;
		await supabase.auth.api.signOut(session.access_token);
		await supabase.auth.signOut();
	};

	return (
		<Main>
			<Auth supabaseClient={supabase} />
		</Main>
	);
}

export async function getServerSideProps({ req, res }: { req: RequestData; res: any }) {
	const { user, error: userError } = await supabase.auth.api.getUserByCookie(req, res);

	return { props: { user } };
}
