import theme from "@/styles/theme";
import { tempStore } from "@/utils/store";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import { Button } from "./Button";

export default function ManageButton({ gid }: { gid: string }) {
    const router = useRouter();

    async function updateGroup() {
		const groupName = tempStore.getState().groupName;
        const groupMembers = tempStore.getState().groupMembers;

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

    return (
        <div className={"grid grid-cols-2 gap-2"}>
            <Button
                size={"sm"}
                style={{ background: theme.colors.gradient.a }}
                onClick={() => updateGroup()}
            >
                Update
            </Button>
            <Button
                size={"sm"}
                background={theme.colors.gradient.a}
                onClick={() => deleteGroup()}
            >
                Delete
            </Button>
        </div>
    );
}