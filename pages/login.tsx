import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";
import { sessionStore, uiStore } from "@/utils/store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Toast from "@/components/Toast";
import { Content } from "@/components/Main";
import { RequestData } from "next/dist/server/web/types";
import { NextApiResponse } from "next";

export default function Login() {
	const router = useRouter();
	const setSession = sessionStore.getState().setSession;

	useEffect(() => {
		uiStore.getState().setShowNavbar(false);

		const { session_expired } = router.query;
		session_expired && uiStore.getState().setShowSessionExpired(true);

		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN") {
				setSession(session);
				fetch("/api/auth", {
					method: "POST",
					headers: new Headers({ "Content-Type": "application/json" }),
					credentials: "same-origin",
					body: JSON.stringify({ event, session }),
				})
					.then((res) => res.json())
					.then(() => router.push("/"));
			}
		});

		return () => {
			authListener?.unsubscribe();
			uiStore.getState().setShowSessionExpired(false);
			uiStore.getState().setShowNavbar(true);
		};
	}, []);

	return (
		<Content>
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

export async function getServerSideProps({ req, res }: { req: RequestData; res: NextApiResponse }) {
	const { user, error } = await supabase.auth.api.getUserByCookie(req, res);

	// If there is a user, redirect to index.
	if (user) {
		return {
			props: {},
			redirect: { destination: "/", permanent: false },
		};
	}

	return { props: {} };
}
