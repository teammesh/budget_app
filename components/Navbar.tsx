import { Button } from "@/components/Button";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Navbar = () => {
	const [activeRoute, setActiveRoute] = useState("");

	useEffect(() => {
		isActive();
	}, []);

	const isActive = () => {
		if (!window) return;

		setActiveRoute(window.location.pathname);
	};

	return (
		<div
			className={
				"fixed bottom-0 pb-6 pt-2 grid grid-cols-[auto_auto] gap-2 justify-center left-0 right-0"
			}
		>
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
	);
};
