import { useEffect } from "react";
import { sessionStore } from "@/utils/store";

export const Main = ({ children, profile }: { children: any; profile: any }) => {
	useEffect(() => {
		sessionStore.getState().setProfile(profile);
	}, []);

	return <div className={"h-full bg-black text-white p-3"}>{children}</div>;
};
