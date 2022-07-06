import "@/styles/globals.css";
import "public/static/fonts/Favorit_Mono/font.css";
import "public/static/fonts/Oakes_Grotesk/font.css";
import type { AppProps } from "next/app";
import { supabase } from "@/utils/supabaseClient";
import { Auth } from "@supabase/ui";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Auth.UserContextProvider supabaseClient={supabase}>
			<Component {...pageProps} />
		</Auth.UserContextProvider>
	);
}

export default MyApp;
