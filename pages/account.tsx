import { supabase } from "@/utils/supabaseClient";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { tempStore } from "@/utils/store";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";
import { Content } from "@/components/Main";
import { NextApiResponse } from "next";
import { ProfileAvatarUpload } from "@/components/ProfileAvatarUpload";
import { useEffect } from "react";

export default function Account({
	user,
	profile,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
}) {
	const router = useRouter();

	useEffect(() => {
		tempStore.getState().setUsername(profile.username ? profile.username : "");
		tempStore.getState().setWebsite(profile.website ? profile.website : "");
		tempStore.getState().setAvatarUrl(profile.avatar_url ? profile.avatar_url : "");
	}, []);

	async function updateProfile() {
		const username = tempStore.getState().username;
		const website = tempStore.getState().website;
		const avatar_url = tempStore.getState().avatarUrl;

		try {
			const updates = {
				id: user.id,
				username,
				website,
				avatar_url,
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates, {
				returning: "minimal", // Don't return the value after inserting
			});

			if (error && error.code === "23505") {
				alert("Woops, username is already taken.");
			}
		} catch (error: any) {
			alert(error.message);
		}
	}

	return (
		<Content className={"grid grid-cols-1 gap-8"}>
			<div className={"flex justify-between"}>
				<Button
					size={"sm"}
					style={{ background: theme.colors.gradient.a }}
					onClick={() => router.back()}
				>
					<ArrowLeftIcon />
					Return
				</Button>
				<Button
					size={"sm"}
					style={{ background: theme.colors.gradient.a }}
					onClick={async () => {
						// sessionStorage and localStorage are also cleared via authlistener in Main
						const access_token = supabase.auth.session()?.access_token;
						if (!access_token) return;
						await supabase.auth.api.signOut(access_token);
						await supabase.auth.signOut();
					}}
				>
					<ExitIcon />
					Logout
				</Button>
			</div>
			<div className="grid grid-cols-1 gap-4 pt-4">
				<ProfileAvatarUpload
					avatarUrl={profile.avatar_url}
					avatarName={profile.username}
					profileId={profile.id}
				/>
				<Field>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="text" value={user.email} disabled />
				</Field>
				<UsernameInput />
			</div>
			<div className={"grid grid-cols-1 gap-4"}>
				<Button size={"sm"} onClick={() => updateProfile()} border={theme.colors.gradient.a}>
					Update
				</Button>
			</div>
		</Content>
	);
}

const UsernameInput = () => {
	const username = tempStore((state) => state.username);

	return (
		<Field>
			<Label htmlFor="username">Username</Label>
			<Input
				id="username"
				type="text"
				value={username || ""}
				onChange={(e) => tempStore.getState().setUsername(e.target.value)}
			/>
		</Field>
	);
};

export async function getServerSideProps({ req, res }: { req: RequestData; res: NextApiResponse }) {
	return verifyUser(req, res);
}
