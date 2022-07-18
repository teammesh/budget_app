import "@/styles/globals.css";
import "public/static/fonts/Favorit_Mono/font.css";
import "public/static/fonts/Oakes_Grotesk/font.css";
import type { AppProps } from "next/app";
import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";
import { Loading } from "@/components/Loading";
import { uiStore } from "@/utils/store";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/Main";
import { useRouter } from "next/router";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Auth.UserContextProvider supabaseClient={supabase}>
			<Main>
				<AnimatePresence>
					<Component {...pageProps} />
				</AnimatePresence>
				<Navbar />
			</Main>
			<GlobalLoading />
		</Auth.UserContextProvider>
	);
}

const GlobalLoading = () => {
	const router = useRouter();
	const globalLoading = uiStore((state) => state.globalLoading);

	useEffect(() => {
		router.events.on("routeChangeStart", () => uiStore.getState().setGlobalLoading(true));
		router.events.on("routeChangeComplete", () => uiStore.getState().setGlobalLoading(false));
	}, [router]);

	if (!globalLoading) return null;
	return <Loading />;
};

export default MyApp;
