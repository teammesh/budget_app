import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Groups() {
    const profile_id = supabase.auth.session()?.user?.id;
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [members, setMembers] = useState<string[]>([]);
    const [groups, setGroups] = useState<string[]>([]);

    useEffect(() => {
        supabase
            .from("profiles")
            .select()
            .eq("id", profile_id)
            .then(({ data, error }) => setGroups(data[0].groups));
    }, []);

    const handleCreateGroup = async (groupName: string) => {
        try {
            setLoading(true);

            // Create group
            const { data: groupsData, error } = await supabase.from("groups").insert([
                { "name": groupName },
            ]);

            // Update current user with new group
            const { data: profileData, error: profileError } = await supabase.from("profiles").update({
                groups: [groupsData[0].id, ...groups],
            }).eq("id", profile_id);

            // Update list of groups in page
            setGroups(profileData[0].groups);

            // Update members' group list
            members.map(async (member) => {
                console.log(member);
                const { data: memberData } = await supabase.from("profiles")
                    .select()
                    .eq("username", member);

                await supabase.from("profiles").update({
                    groups: [groupsData[0].id, ...memberData[0].groups],
                }).eq("username", member);
            });

            if (error) throw error;
            alert("Group created!");
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <h1 className="text-center">Groups</h1>
                <h2 className="text-center">Create a group</h2>
                <div className="pt-3">
                    <input
                        className="inputField"
                        type="text"
                        placeholder="Group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>
                <div className="pt-3">
                    <input
                        className="inputField"
                        type="text"
                        placeholder="Members"
                        value={members}
                        onChange={(e) => setMembers(e.target.value.split(","))}
                    />
                </div>
                <div className="pt-3">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleCreateGroup(groupName);
                        }}
                        className="button block"
                        disabled={loading}
                    >
                        <span>{loading ? "Loading" : "Create group"}</span>
                    </button>
                </div>
                <h2 className="pt-3">Your current groups</h2>
                <ul>
                    { groups.length > 0 ? groups.map((group) => (
                        <li key={group}>{group}</li>
                    ))
                    : <p>Not currently part of any groups!</p>
                    }
                </ul>
            </div>
        </>
    );
}