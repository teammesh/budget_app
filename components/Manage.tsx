import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { styled } from "@stitches/react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { TextGradient } from "./text";
import { definitions } from "../types/supabase";
import { tempStore } from "@/utils/store";
import { Input } from "@/components/Input";
import { useRouter } from "next/router";

export default function Manage({
	gid,
	setShowManage,
}: {
	gid: string;
	setShowManage: any;
}) {
	const profile_id = supabase.auth.session()?.user?.id;
    const router = useRouter();

    useEffect(() => {
        supabase.from("groups").select().eq("id", gid).then(({ data }) => {
            tempStore.getState().setGroupName(data ? data[0].name : ""); 
        });
    }, [gid]);

    async function updateGroup() {
		const groupName = tempStore.getState().groupName;

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
			}
		} catch (error: any) {
			alert(error.message);
		}
	}

    async function deleteGroup() {
		try {
			const { error } = await supabase.from("groups").upsert({ id: gid, is_deleted: true }, {
				returning: "minimal", // Don't return the value after inserting
			});

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

	const Container = styled("div", {
		position: "fixed",
		top: 0,
		bottom: "124px",
		left: 0,
		right: 0,
		zIndex: 99,
	});

	return (
		<Container className={"bg-black p-3 grid grid-cols-1 gap-4 content-start overflow-auto"}>
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
				<div>
					<Button size={"sm"} onClick={() => updateGroup()}>
						Update
					</Button>
				</div>

				<div>
					<Button
						size={"sm"}
						onClick={async () => deleteGroup()}
					>
						Delete Group
					</Button>
				</div>
			</div>
		</Container>
	);
}

const NameInput = () => {
	const groupName = tempStore((state) => state.groupName);

	return (
		<div>
			<label htmlFor="groupName">Group name</label>
			<Input
				id="groupName"
				type="text"
				value={groupName || ""}
                onChange={(e) => tempStore.getState().setGroupName(e.target.value)}
			/>
		</div>
	);
};