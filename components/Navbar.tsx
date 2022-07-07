import { Button } from "@/components/Button";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { isToolbarShownAtom } from "./Main";

export const Navbar = ({ toolbar }: { toolbar?: any }) => {
	const [activeRoute, setActiveRoute] = useState("");
	const [isToolbarShown, setIsToolbarShown] = useAtom(isToolbarShownAtom);

	useEffect(() => {
		isActive();
		toolbar && setIsToolbarShown(true);
	}, []);

	const isActive = () => {
		if (!window) return;

		setActiveRoute(window.location.pathname);
	};

	return (
		<div className={"fixed bottom-0 left-0 right-0 bg-black"}>
			{toolbar && <Toolbar>{toolbar}</Toolbar>}
			<div className={"grid grid-cols-[auto_auto] gap-2 pb-6 pt-2 justify-center "}>
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

const Toolbar = ({ children }: { children: any }) => {
	return <div className={"bg-black-500 w-full p-3"}>{children}</div>;
};
