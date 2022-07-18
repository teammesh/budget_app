import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { Header, TextGradient } from "@/components/text";
import { Widget } from "@/components/Widget";
import Link from "next/link";
import { Group } from "@/components/Group";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalContent } from "@/components/Modal";
import { Input } from "@/components/Input";
import React, { useEffect, useState } from "react";
import { isNil } from "ramda";
import { Button } from "@/components/Button";
import { ArrowLeftIcon, LightningBoltIcon, PlusIcon } from "@radix-ui/react-icons";
import theme from "@/styles/theme";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { Content } from "@/components/Main";
import { NextApiResponse } from "next";

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

		return () => {
			supabase.removeAllSubscriptions();
		};
	}, []);

	const handleCreateGroup = async (groupName: string | undefined, groupMembers: Array<string>) => {
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

	const Toolbar = () => {
		const [groupName, setGroupName] = useState<string>();
		const [groupMembers, setGroupMembers] = useState<string[]>([]);

		return (
			<div className={"flex justify-end pt-3 px-3"}>
				<Dialog.Root>
					<Dialog.Trigger asChild>
						<Button size={"sm"} background={theme.colors.gradient.a}>
							<PlusIcon /> Create Group
						</Button>
					</Dialog.Trigger>
					<ModalContent>
						<div className={"grid grid-cols-1 gap-2 text-center"}>
							<Dialog.Title className={"font-medium text-md"}>Create a group</Dialog.Title>
							<Dialog.Description className={"text-sm text-gray-600"}>
								Enter the name of your group and the usernames of those you'd like to invite.
							</Dialog.Description>
						</div>
						<div className={"grid grid-cols-1 gap-2"}>
							<Input
								key="group_name"
								placeholder="Group name"
								onChange={(e) => setGroupName(e.target.value)}
							/>
							<Input
								key="group_members"
								placeholder="Members"
								onChange={(e) => setGroupMembers(e.target.value.split(","))}
							/>
						</div>
						<div className={"grid grid-cols-1 gap-2"}>
							<Dialog.Close asChild>
								<Button size={"sm"} border={theme.colors.gradient.a}>
									<ArrowLeftIcon />
									Cancel
								</Button>
							</Dialog.Close>
							<Dialog.Close asChild>
								<Button
									size={"sm"}
									background={theme.colors.gradient.a}
									onClick={() => handleCreateGroup(groupName, groupMembers)}
								>
									<LightningBoltIcon />
									Create
								</Button>
							</Dialog.Close>
						</div>
					</ModalContent>
				</Dialog.Root>
			</div>
		);
	};

	return (
		<>
			<Content>
				<div className={"justify-self-start mt-6"}>
					<Header>
						Welcome{" "}
						<TextGradient gradient={theme.colors.gradient.a}>{profile.username}</TextGradient>,
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
			</Content>
			<Toolbar />
		</>
	);
}

export async function getServerSideProps({ req, res }: { req: RequestData; res: NextApiResponse }) {
	const { props, redirect } = await verifyUser(req, res);
	const groups = await findGroups(props.user?.id);

	return { props: { ...props, groups }, redirect };
}

const findGroups = async (profile_id?: string) => {
	if (!profile_id) return null;

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
