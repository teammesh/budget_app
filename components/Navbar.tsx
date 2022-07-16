import { Button } from "@/components/Button";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { isToolbarShownAtom } from "./Main";
import { uiStore } from "@/utils/store";
import { Toolbar } from "./Toolbar";

export const Navbar = () => {
	const [activeRoute, setActiveRoute] = useState("");
	const [isToolbarShown, setIsToolbarShown] = useAtom(isToolbarShownAtom);
	const toolbar = uiStore((state) => state.toolbar);
	const showNavbar = uiStore((state) => state.showNavbar);

	useEffect(() => {
		isActive();
		toolbar && setIsToolbarShown(true);
	}, [toolbar]);

	const isActive = () => {
		if (!window) return;

		setActiveRoute(window.location.pathname);
	};

	if (!showNavbar) return null;

	return (
		<div
			className={
				"fixed bottom-0 left-0 right-0 bg-black grid grid-cols-1 grid-rows-[auto_auto] overflow-hidden"
			}
		>
			{toolbar && <Toolbar>{toolbar()}</Toolbar>}
			<div className={"grid grid-cols-[auto_auto] gap-2 py-3 justify-center "}>
				<Link href={"/"} passHref>
					<Button
						size={"sm"}
						style={{
							background: activeRoute === "/" ? theme.colors.gradient.c : theme.colors.gray["800"],
						}}
					>
						<HomeIcon /> <span>Home</span>
					</Button>
				</Link>
				<Link href={"/account"}>
					<Button
						size={"sm"}
						style={{
							background:
								activeRoute === "/account" ? theme.colors.gradient.c : theme.colors.gray["800"],
						}}
					>
						<PersonIcon /> <span>Account</span>
					</Button>
				</Link>
			</div>
		</div>
	);
};
