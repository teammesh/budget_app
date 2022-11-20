import { useEffect } from "react";
import { sessionStore } from "@/utils/store";
import { useRouter } from "next/router";

export default function OAuth() {
	const router = useRouter();
	const plaidReturnToUrl = sessionStore((state) => state.plaidReturnToUrl);

	// redirect the user to the previous route they were in, then reinitialize plaid link
	useEffect(() => {
		if (!plaidReturnToUrl) router.push("/");

		sessionStore.getState().setPlaidReceivedRedirectUri(window.location.href);
		router.push(sessionStore.getState().plaidReturnToUrl);
	}, []);

	return (
		<div className="auth__content">
			<div id={"plaid-redirect"}>Please wait, you are being redirected...</div>
		</div>
	);
}
