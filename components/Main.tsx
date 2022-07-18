import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { sessionStore } from "@/utils/store";

export const Main = ({ children }: { children: any }) => {
	const router = useRouter();

	const variants = {
		hidden: { opacity: 0, x: 0, y: 10 },
		enter: { opacity: 1, x: 0, y: 0 },
		exit: { opacity: 0, x: 0, y: -100 },
	};

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_OUT") {
				// remove cookies from SSR
				fetch("/api/auth", {
					method: "POST",
					headers: new Headers({ "Content-Type": "application/json" }),
					credentials: "same-origin",
					body: JSON.stringify({ event, session }),
				}).then((res) => res.json());

				sessionStore.getState().setSession(null);
				sessionStore.getState().setAccounts({});
				localStorage.clear();
				sessionStorage.clear();
				return router.push("/login");
			}
		});

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	return (
		<motion.main
			variants={variants} // Pass the variant object into Framer Motion
			initial="hidden" // Set the initial state to variants.hidden
			animate="enter" // Animated state to variants.enter
			exit="exit" // Exit state (used later) to variants.exit
			transition={{ type: "just" }} // Set the transition to linear
			className={
				"h-full bg-black text-white grid grid-cols-1 grid-rows-[1fr_auto_auto] items-start"
			}
		>
			{children}
		</motion.main>
	);
};

export const Content = ({ children, ref }: any) => {
	return (
		<div
			ref={ref}
			className={"grid grid-cols-1 gap-4 overflow-x-hidden overflow-y-auto max-h-full p-3 relative"}
		>
			{children}
		</div>
	);
};
