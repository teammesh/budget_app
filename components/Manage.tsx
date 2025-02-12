import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "./Button";
import { tempStore } from "@/utils/store";
import { Input } from "@/components/Input";
import { useRouter } from "next/router";
import { Content } from "@/components/Main";
import { Field } from "./Field";
import { Label } from "./Label";
import { GroupAvatarUpload } from "./GroupAvatarUpload";

export default function Manage({ gid, setShowManage }: { gid: string; setShowManage: any }) {
	const router = useRouter();
	const groupAvatar = tempStore((state) => state.groupAvatarUrl);
	const groupName = tempStore((state) => state.groupName);

	async function updateGroup() {
		// TODO need to account for removing members from the group?
		try {
			const updates = {
				id: gid,
				name: groupName,
			};

			const { error } = await supabase.from("groups").upsert(updates, {
				returning: "minimal",
			});

			if (error) {
				throw error;
			} else {
				alert("Updated successfully!");
			}
		} catch (error: any) {
			alert(error.message);
		}
	}

	async function deleteGroup() {
		try {
			const { error } = await supabase
				.from("groups")
				.upsert({ id: gid, is_deleted: true }, { returning: "minimal" });

			if (error) {
				throw error;
			} else {
				alert("Group deleted!");
				router.push("/");
			}
		} catch (error: any) {
			alert(error.message);
		}
	}

	const Toolbar = () => (
		<div className={"grid grid-cols-2 gap-2 pt-3 px-3"}>
			<Button
				size={"sm"}
				style={{ background: theme.colors.gradient.a }}
				onClick={() => updateGroup()}
			>
				Update
			</Button>
			<Button size={"sm"} background={theme.colors.gradient.a} onClick={() => deleteGroup()}>
				Delete
			</Button>
		</div>
	);

	return (
		<>
			<Content className={"grid grid-cols-1 gap-8"}>
				<div className={"flex justify-between"}>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={() => {
							setShowManage(false);
						}}
					>
						<ArrowLeftIcon />
						Cancel
					</Button>
				</div>
				<div className="grid grid-cols-1 gap-4 pt-4">
					<GroupAvatarUpload avatarUrl={groupAvatar} avatarName={groupName} groupId={gid} />
					<NameInput />
					<MembersInput />
				</div>
			</Content>
			<Toolbar />
		</>
	);
}

const NameInput = () => {
	const groupName = tempStore((state) => state.groupName);

	return (
		<Field>
			<Label htmlFor="groupName">Group name</Label>
			<Input
				id="groupName"
				type="text"
				value={groupName || ""}
				onChange={(e) => tempStore.getState().setGroupName(e.target.value)}
			/>
		</Field>
	);
};

const MembersInput = () => {
	const groupMembers = tempStore((state) => state.groupMembers);

	return (
		<Field>
			<Label htmlFor="groupMembers">Group members</Label>
			<Input
				id="groupMembers"
				type="text"
				value={groupMembers || ""}
				onChange={(e) => tempStore.getState().setGroupMembers(e.target.value)}
			/>
		</Field>
	);
};
