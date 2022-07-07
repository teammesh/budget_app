import { useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import { styled } from "@stitches/react";
import { useAtom, atom } from "jotai";

export const isToolbarShownAtom = atom(false);

export const Main = ({ children }: { children: any }) => {
	const router = useRouter();
	const [isToolbarShown] = useAtom(isToolbarShownAtom);

	const Container = styled("div", {
		"& > div:first-of-type": {
			overflow: "auto",
			height: isToolbarShown ? "calc(100% - 144px)" : "calc(100% - 76px)",
			alignContent: "start",
			paddingBottom: "2rem",
		},
	});

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

	return <Container className={"h-full bg-black text-white p-3"}>{children}</Container>;
};
