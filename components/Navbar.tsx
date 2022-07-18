import { Button } from "@/components/Button";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import Link from "next/link";
import { useEffect, useState } from "react";
import { uiStore } from "@/utils/store";
import { Toolbar } from "./Toolbar";
import { useRouter } from "next/router";

export const Navbar = () => {
	const router = useRouter();
	const [activeRoute, setActiveRoute] = useState("");
	const isToolbarShown = uiStore((state) => state.isToolbarShown);
	const showNavbar = uiStore((state) => state.showNavbar);

	useEffect(() => {
		isActive();
	}, [router]);

	const isActive = () => {
		if (!window) return;

		setActiveRoute(window.location.pathname);
	};

	if (!showNavbar) return null;

	return (
		<div className={"bg-black grid grid-cols-1 overflow-hidden"}>
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
