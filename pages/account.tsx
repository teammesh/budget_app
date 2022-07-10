import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/Main";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { tempStore } from "@/utils/store";
import { Button } from "@/components/Button";

export default function Account({
	user,
	profile,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
}) {
	tempStore.getState().setUsername(profile.username ? profile.username : "");
	tempStore.getState().setWebsite(profile.website ? profile.website : "");
	tempStore.getState().setAvatarUrl(profile.avatar_url ? profile.avatar_url : "");

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
		<Main>
			<div className="form-widget">
				<div>
					<label htmlFor="email">Email</label>
					<Input id="email" type="text" value={user.email} disabled />
				</div>
				<UsernameInput />
				<AvatarUrlInput />
				<WebsiteInput />
				<div>
					<Button size={"sm"} onClick={() => updateProfile()}>
						Update
					</Button>
				</div>

				<div>
					<Button
						size={"sm"}
						onClick={async () => {
							const access_token = supabase.auth.session()?.access_token;
							if (!access_token) return;
							await supabase.auth.api.signOut(access_token);
							await supabase.auth.signOut();
						}}
					>
						Sign Out
					</Button>
				</div>
			</div>
			<Navbar />
		</Main>
	);
}

const UsernameInput = () => {
	const username = tempStore((state) => state.username);

	return (
		<div>
			<label htmlFor="username">Name</label>
			<Input
				id="username"
				type="text"
				value={username || ""}
				onChange={(e) => tempStore.getState().setUsername(e.target.value)}
			/>
		</div>
	);
};

const AvatarUrlInput = () => {
	const avatar_url = tempStore((state) => state.avatarUrl);

	return (
		<div>
			<label htmlFor="avatar_url">Avatar URL</label>
			<Input
				id="avatar_url"
				type="avatar_url"
				value={avatar_url || ""}
				onChange={(e) => tempStore.getState().setAvatarUrl(e.target.value)}
			/>
		</div>
	);
};

const WebsiteInput = () => {
	const website = tempStore((state) => state.website);

	return (
		<div>
			<label htmlFor="website">Website</label>
			<Input
				id="website"
				type="website"
				value={website || ""}
				onChange={(e) => tempStore.getState().setWebsite(e.target.value)}
			/>
		</div>
	);
};

export async function getServerSideProps({ req }: { req: RequestData }) {
	return verifyUser(req);
}
