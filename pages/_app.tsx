import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Main } from "@/components/Main";
import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";

function MyApp({ Component, pageProps }: AppProps) {
	const setSession = sessionStore.getState().setSession;

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		supabase
			.from("profiles")
			.select()
			.eq("id", supabase.auth.user()?.id)
			.then(({ data, error }) => {
				if (error) supabase.auth.signOut();

				sessionStore.getState().setProfile(data[0]);
			});
	}, []);

	return (
		<Main>
			<Component {...pageProps} />
		</Main>
	);
}

export default MyApp;
