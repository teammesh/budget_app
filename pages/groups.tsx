import { useEffect, useState } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import Link from "next/link";
import { sessionStore, tempStore } from "@/utils/store";
import { isNil } from "ramda";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/Input";
import { Content } from "@/components/Modal";
import { Header } from "@/components/text";
import { Widget } from "@/components/Widget";
import { Group } from "@/components/Group";
import dynamic from "next/dynamic";

const TextGradient = dynamic(() => import("@/components/text"), {
	ssr: false,
});

export default function Groups({ profile }: { profile: any }) {
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
		<div className="grid grid-cols-1 gap-16">
			<div className={"justify-self-start"}>
				<Header>
					Welcome <TextGradient>{profile.username}</TextGradient>,
				</Header>
				<div className={"self-start grid grid-cols-[auto_auto] gap-2"}>
					<Widget amount={200} label={"Total owed"} />
					<Widget amount={200} label={"Total refund"} />
				</div>
			</div>
			<div>
				<Header>
					Your <TextGradient>groups</TextGradient>
				</Header>
				<div className="grid grid-cols-1 gap-2">
					{groups.length > 0 ? (
						groups.map((group) => (
							<Link href={`/group/${group.group_id}`} key={group.groups.name} passHref>
								<Group group={group} />
							</Link>
						))
					) : (
						<div>You are currently not in any groups</div>
					)}
				</div>
			</div>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<button>Create Group</button>
				</Dialog.Trigger>
				<Content>
					<Dialog.Title>Group name</Dialog.Title>
					<Dialog.Description>Let's create a group!</Dialog.Description>
					<Input placeholder="Group name" onChange={(e) => setGroupName(e.target.value)} />
					<Input placeholder="Members" onChange={(e) => setMembers(e.target.value.split(","))} />
					<Dialog.Close asChild>
						<button onClick={() => handleCreateGroup()}>Create</button>
					</Dialog.Close>
				</Content>
			</Dialog.Root>
		</div>
	);
}
