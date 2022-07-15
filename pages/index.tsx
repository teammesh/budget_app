import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { Header, TextGradient } from "@/components/text";
import { Widget } from "@/components/Widget";
import Link from "next/link";
import { Group } from "@/components/Group";
import * as Dialog from "@radix-ui/react-dialog";
import { Content } from "@/components/Modal";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import { isNil } from "ramda";
import { Button } from "@/components/Button";
import { PlusIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import { verifyUser } from "@/utils/ssr";
import { tempStore, uiStore } from "@/utils/store";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";

export default function Home({
	user,
	profile,
	groups,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
	groups: definitions["profiles_groups"][];
}) {
	const profile_id = supabase.auth.session()?.user?.id;
	const setGroupName = tempStore.getState().setGroupName;
	const setGroupMembers = tempStore.getState().setGroupMembers;
	const [userGroups, setUserGroups] = useState(groups);
	const totalOwed = userGroups.reduce((prev, curr) => {
		if (!curr.amount_owed) return prev;
		const owed = Number(curr.amount_owed);
		return Math.sign(owed) === -1 ? owed - prev : prev;
	}, 0);
	const totalRefund = userGroups.reduce((prev, curr) => {
		if (!curr.amount_owed) return prev;
		const owed = Number(curr.amount_owed);
		return Math.sign(owed) === 1 ? owed + prev : prev;
	}, 0);

	useEffect(() => {
		if (profile_id) {
			supabase
				.from(`profiles_groups:profile_id=eq.${supabase.auth.session()?.user?.id}`)
				.on("*", async (payload) => {
					console.log("Change received!", payload);
					setUserGroups(await findGroups(profile_id));
				})
				.subscribe();
		}
		uiStore.getState().setToolbar(toolbarProps);
	}, []);

	const handleCreateGroup = async () => {
		const groupName = tempStore.getState().groupName;
		const groupMembers = tempStore.getState().groupMembers;

		// Create group
		const { data: groupsData, error } = await supabase.from("groups").insert([{ name: groupName }]);
		if (!groupsData || groupsData.length === 0) return;

		// Attach current user to group
		const { data: profileData } = await supabase
			.from("profiles_groups")
			.insert({ group_id: groupsData[0].id, profile_id: supabase.auth.session()?.user?.id })
			.select("*, profiles(username)");
		if (!profileData || profileData.length === 0) return;

		// Get profile_ids of invitees
		if (groupMembers) {
			const tmp = await Promise.all(
				groupMembers?.map(async (member: any) => {
					if (profileData[0].profiles.username === member) return;

					const { data: memberData } = await supabase
						.from("profiles")
						.select()
						.eq("username", member);
					if (!memberData || memberData.length === 0) return;

					if (memberData?.length > 0)
						return { group_id: groupsData[0].id, profile_id: memberData[0].id };
					else console.error(`user: ${member} not found`);
				}),
			);
			const req = tmp?.filter((x) => !isNil(x));

			// Add profiles_groups entry for invitees
			if (req.length > 0) {
				await supabaseQuery(() => supabase.from("profiles_groups").insert(req), true);
			}
		}
	};

	const toolbarProps = () => (
		<div className={"flex justify-end"}>
			<Dialog.Root>
				<Dialog.Trigger asChild>
					<Button size={"sm"} background={theme.colors.gradient.a}>
						<PlusIcon /> Create Group
					</Button>
				</Dialog.Trigger>
				<Content>
					<Dialog.Title>Group name</Dialog.Title>
					<Dialog.Description>Let's create a group!</Dialog.Description>
					<Input placeholder="Group name" onChange={(e) => setGroupName(e.target.value)} />
					<Input
						placeholder="Members"
						onChange={(e) => setGroupMembers(e.target.value.split(","))}
					/>
					<Dialog.Close asChild>
						<button onClick={() => handleCreateGroup()}>Create</button>
					</Dialog.Close>
				</Content>
			</Dialog.Root>
		</div>
	);

	return (
		<div className="grid grid-cols-1 gap-16">
			<div className={"justify-self-start mt-6"}>
				<Header>
					Welcome <TextGradient gradient={theme.colors.gradient.a}>{profile.username}</TextGradient>
					,
				</Header>
				<div className={"self-start grid grid-cols-[auto_auto] gap-2"}>
					<Widget amount={totalOwed} label={"Total owed"} />
					<Widget amount={totalRefund} label={"Total refund"} />
				</div>
			</div>
			<div>
				<Header>
					Your <TextGradient gradient={theme.colors.gradient.a}>groups</TextGradient>
				</Header>
				<div className="grid grid-cols-1 gap-2">
					{userGroups.length > 0 ? (
						userGroups.map((group: any) => (
							<Link href={`/group/${group.group_id}`} key={group.groups.name} passHref>
								<Group group={group} />
							</Link>
						))
					) : (
						<div>You are currently not in any groups</div>
					)}
				</div>
			</div>
		</div>
	);
}

export async function getServerSideProps({ req }: { req: RequestData }) {
	const { props, redirect } = await verifyUser(req);
	const groups = await findGroups(props.user?.id);

	return { props: { ...props, groups }, redirect };
}

const findGroups = async (profile_id?: string) => {
	if (!profile_id) return;

	const { data } = await supabaseQuery(
		() =>
			supabase
				.from("profiles_groups")
				.select("group_id, amount_owed, groups!inner(*)")
				.eq("profile_id", profile_id)
				.eq("groups.is_deleted", false),
		true,
	);
	return data;
};
