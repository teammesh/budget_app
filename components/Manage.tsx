import theme from "@/styles/theme";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { styled } from "@stitches/react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { tempStore } from "@/utils/store";
import { Input } from "@/components/Input";

export default function Manage({
	gid,
	setShowManage,
}: {
	gid: string;
	setShowManage: any;
}) {
    useEffect(() => {
        supabase.from("groups").select().eq("id", gid).then(({ data }) => {
            tempStore.getState().setGroupName(data ? data[0].name : ""); 
        });
    }, [gid]);

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
                <MembersInput />
			</div>
		</Container>
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