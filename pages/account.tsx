import { supabase } from "@/utils/supabaseClient";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { tempStore, uiStore } from "@/utils/store";
import { Button } from "@/components/Button";
import { useEffect } from "react";
import theme from "@/styles/theme";
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";

export default function Account({
	user,
	profile,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
}) {
	const router = useRouter();
	tempStore.getState().setUsername(profile.username ? profile.username : "");
	tempStore.getState().setWebsite(profile.website ? profile.website : "");
	tempStore.getState().setAvatarUrl(profile.avatar_url ? profile.avatar_url : "");

	useEffect(() => {
		uiStore.getState().setToolbar(null);
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

			if (error) {
				throw error;
			}
		} catch (error: any) {
			alert(error.message);
		}
	}

	return (
		<div className={"grid grid-cols-1 gap-8"}>
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
					onClick={() => async () => {
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
				<Field>
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="text" value={user.email} disabled />
				</Field>
				<UsernameInput />
				<AvatarUrlInput />
				{/*<WebsiteInput />*/}
			</div>
			<div className={"grid grid-cols-1 gap-4"}>
				<Button size={"sm"} onClick={() => updateProfile()} border={theme.colors.gradient.a}>
					Update
				</Button>
			</div>
		</div>
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

const AvatarUrlInput = () => {
	const avatar_url = tempStore((state) => state.avatarUrl);

	return (
		<Field>
			<Label htmlFor="avatar_url">Avatar URL</Label>
			<Input
				id="avatar_url"
				type="avatar_url"
				value={avatar_url || ""}
				onChange={(e) => tempStore.getState().setAvatarUrl(e.target.value)}
			/>
		</Field>
	);
};

const WebsiteInput = () => {
	const website = tempStore((state) => state.website);

	return (
		<Field>
			<Label htmlFor="website">Website</Label>
			<Input
				id="website"
				type="website"
				value={website || ""}
				onChange={(e) => tempStore.getState().setWebsite(e.target.value)}
			/>
		</Field>
	);
};

export async function getServerSideProps({ req }: { req: RequestData }) {
	return verifyUser(req);
}
