import { Main } from "@/components/Main";
import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";
import { sessionStore } from "@/utils/store";
import useSWR from "swr";
import { fetcher } from "@/utils/helper";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
	const router = useRouter();
	const { user, session } = Auth.useUser();
	const setSession = sessionStore.getState().setSession;
	const { data, error } = useSWR(session ? ["/api/getUser", session.access_token] : null, fetcher);

	useEffect(() => {
		setSession(supabase.auth.session());

		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);

			fetch("/api/auth", {
				method: "POST",
				headers: new Headers({ "Content-Type": "application/json" }),
				credentials: "same-origin",
				body: JSON.stringify({ event, session }),
			}).then((res) => res.json());
		});

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	if (user) router.push("/");

	return (
		<Main>
			<Auth supabaseClient={supabase} providers={["google", "facebook", "github"]} />
		</Main>
	);
}
