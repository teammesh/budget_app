import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";

export const Main = ({ children }: { children: any }) => {
	const router = useRouter();

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_OUT") {
				localStorage.clear();
				sessionStorage.clear();
				return router.push("/login");
			}
		});

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	return <div className={"h-full bg-black text-white p-3"}>{children}</div>;
};
