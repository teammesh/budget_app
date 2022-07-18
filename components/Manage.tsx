import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { styled } from "@stitches/react";
import { useEffect } from "react";
import { Button } from "./Button";
import { tempStore, uiStore } from "@/utils/store";
import { Input } from "@/components/Input";
import { useRouter } from "next/router";
import { Content } from "@/components/Main";

export default function Manage({ gid, setShowManage }: { gid: string; setShowManage: any }) {
	const router = useRouter();
	const groupName = tempStore.getState().groupName;
	const groupMembers = tempStore.getState().groupMembers;

	useEffect(() => {
		supabase
			.from("groups")
			.select()
			.eq("id", gid)
			.then(({ data }) => {
				tempStore.getState().setGroupName(data ? data[0].name : "");
			});
	}, [gid]);

	async function updateGroup() {
		// TODO need to account for removing members from the group?

		try {
			const updates = {
				id: gid,
				name: groupName,
				// updated_at: new Date(),
			};

			const { error } = await supabase.from("groups").upsert(updates, {
				returning: "minimal", // Don't return the value after inserting
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
			const { error } = await supabase.from("groups").upsert(
				{ id: gid, is_deleted: true },
				{
					returning: "minimal", // Don't return the value after inserting
				},
			);

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
		<div className={"grid grid-cols-2 gap-2"}>
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
			<Content>
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
				<div className="form-widget">
					<NameInput />
					<MembersInput />
				</div>
			</Content>
			<Toolbar />
		</>
	);
}

const NameInput = () => {
	const field = tempStore((state) => state.groupName);

	return (
		<div>
			<label htmlFor="groupName">Group name</label>
			<Input
				id="groupName"
				type="text"
				value={field || ""}
				onChange={(e) => tempStore.getState().setGroupName(e.target.value)}
			/>
		</div>
	);
};

const MembersInput = () => {
	const field = tempStore((state) => state.groupMembers);

	return (
		<div>
			<label htmlFor="groupMembers">Group members</label>
			<Input
				id="groupMembers"
				type="text"
				value={field || ""}
				onChange={(e) => tempStore.getState().setGroupMembers(e.target.value)}
			/>
		</div>
	);
};
