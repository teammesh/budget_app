import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";
import { sessionStore, uiStore } from "@/utils/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RequestData } from "next/dist/server/web/types";
import { AuthUser } from "@supabase/supabase-js";
import Toast from "@/components/Toast";
import { Content } from "@/components/Main";

export default function Login({ user }: { user: AuthUser }) {
	const router = useRouter();
	const setSession = sessionStore.getState().setSession;

	useEffect(() => {
		uiStore.getState().setShowNavbar(false);

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
			uiStore.getState().setShowNavbar(true);
		};
	}, []);

	useEffect(() => {
		if (user) router.push("/");
		else signOut();
	}, [user]);

	const signOut = async () => {
		if (!sessionStore.getState().session) return;
		uiStore.getState().setShowSessionExpired(true);
		await supabase.auth.api.signOut(sessionStore.getState().session.access_token);
		await supabase.auth.signOut();
	};

	return (
		<Content>
			{/*<button onClick={() => setShowSessionExpired(true)}>test</button>*/}
			<SessionExpiredToast />
			<Auth supabaseClient={supabase} />
		</Content>
	);
}

const SessionExpiredToast = () => {
	const showSessionExpired = uiStore((state) => state.showSessionExpired);
	const setShowSessionExpired = uiStore.getState().setShowSessionExpired;

	return (
		<Toast
			open={showSessionExpired}
			setOpen={setShowSessionExpired}
			title={"Your session expired"}
			description={"Please sign in again."}
		/>
	);
};

export async function getServerSideProps({ req, res }: { req: RequestData; res: any }) {
	const { user, error: userError } = await supabase.auth.api.getUserByCookie(req, res);

	return { props: { user } };
}
