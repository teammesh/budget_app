import { useEffect, useRef, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { displayAmount } from "@/components/Amount";
import Link from "next/link";
import { tempStore } from "@/utils/store";
import { isNil } from "ramda";
import * as Dialog from "@radix-ui/react-dialog";
import { keyframes, styled } from "@stitches/react";
import theme from "@/styles/theme";
import { Input } from "@/components/Input";

const overlayShow = keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

const contentShow = keyframes({
	"0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
	"100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledOverlay = styled(Dialog.Overlay, {
	backgroundColor: theme.colors.overlayBg,
	position: "fixed",
	inset: 0,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

const StyledContent = styled(Dialog.Content, {
	backgroundColor: "white",
	borderRadius: 6,
	boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
	position: "fixed",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90vw",
	maxWidth: "450px",
	maxHeight: "85vh",
	padding: 25,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
	"&:focus": { outline: "none" },
});

function Content({ children, ...props }) {
	return (
		<Dialog.Portal>
			<StyledOverlay />
			<StyledContent {...props}>{children}</StyledContent>
		</Dialog.Portal>
	);
}

export default function Groups() {
	const initialRef = useRef(null);
	const finalRef = useRef(null);

	const profile_id = supabase.auth.session()?.user?.id;
	const [groupName, setGroupName] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const groups = tempStore((state) => state.groups);
	const setGroups = tempStore.getState().setGroups;

	useEffect(() => {
		const findGroups = async () => {
			const { data } = await supabaseQuery(
				() =>
					supabase
						.from("profiles_groups")
						.select("group_id, groups(name)")
						.eq("profile_id", profile_id),
				true,
			);
			setGroups(data);
		};

		supabase
			.from(`profiles_groups:profile_id=eq.${supabase.auth.session()?.user?.id}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				findGroups();
			})
			.subscribe();

		findGroups();
	}, []);

	const amountTotal = -2200;

	const handleCreateGroup = async () => {
		// Create group
		const { data: groupsData, error } = await supabase.from("groups").insert([{ name: groupName }]);

		// Attach current user to group
		const { data: profileData } = await supabase
			.from("profiles_groups")
			.insert({ group_id: groupsData[0].id, profile_id: supabase.auth.session()?.user?.id })
			.select("*, profiles(username)");

		// Get profile_ids of invitees
		const tmp = await Promise.all(
			members.map(async (member) => {
				if (profileData[0].profiles.username === member) return;

				const { data: memberData } = await supabase
					.from("profiles")
					.select()
					.eq("username", member);

				if (memberData?.length > 0)
					return { group_id: groupsData[0].id, profile_id: memberData[0].id };
				else console.error(`user: ${member} not found`);
			}),
		);
		const req = tmp.filter((x) => !isNil(x));

		// Add profiles_groups entry for invitees
		if (req.length > 0) {
			await supabaseQuery(() => supabase.from("profiles_groups").insert(req), true);
		}
	};

	return (
		<div className="flex flex-col">
			<div className="flex flex-col items-center">
				<div className="text-lg">{amountTotal < 0 ? "You owe" : "Your pending refund"}</div>
				<div className="pt-2 text-4xl">{displayAmount(amountTotal)}</div>
			</div>
			<div className="pt-20">
				<div className="text-lg text-gray-300">Your groups</div>
			</div>
			<div className="pt-6">
				{groups.length > 0 ? (
					<div className="flex flex-col">
						{groups.map((group) => (
							<div key={group.groups.name} className="pt-5">
								<Link href={`/group/${group.group_id}`}>
									<div className="flex ">
										<div className="flex-initial pr-1">Avatar</div>
										<div className="flex-grow flex flex-col">
											<div className="text-xl">{group.groups.name}</div>
										</div>
										{/*<div className="text-xl text-right">{displayAmount(group.amount)}</div>*/}
									</div>
								</Link>
							</div>
						))}
					</div>
				) : (
					<div>You are currently not in any groups</div>
				)}
			</div>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<button>Create Group</button>
				</Dialog.Trigger>
				<Content>
					<Dialog.Title>Group name</Dialog.Title>
					<Dialog.Description>Let's create a group!</Dialog.Description>
					<Input
						ref={initialRef}
						placeholder="Group name"
						onChange={(e) => setGroupName(e.target.value)}
					/>
					<Input placeholder="Members" onChange={(e) => setMembers(e.target.value.split(","))} />
					<Dialog.Close>
						<button
							onClick={() => {
								handleCreateGroup();
							}}
						>
							Create
						</button>
					</Dialog.Close>
				</Content>
			</Dialog.Root>
		</div>
	);
}
