import { supabase } from "@/utils/supabaseClient";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { tempStore, uiStore } from "@/utils/store";
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
import Toast from "@/components/Toast";
import create from "zustand";

interface StoreState {
	showToast: boolean;
	setShowToast: (x: boolean) => void;
}

const store = create<StoreState>((set, get) => ({
	showToast: false,
	setShowToast: (x) => set(() => ({ showToast: x })),
}));

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
		tempStore.getState().setAvatarUrl(profile.avatar_url ? profile.avatar_url : "");
	}, []);

	async function updateProfile() {
		const username = tempStore.getState().username;
		const avatar_url = tempStore.getState().avatarUrl;
		uiStore.getState().setGlobalLoading(true);

		try {
			const updates = {
				id: user.id,
				username,
				avatar_url,
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates, {
				returning: "minimal", // Don't return the value after inserting
			});

			if (error && error.code === "23505") {
				alert("Woops, username is already taken.");
			}

			uiStore.getState().setGlobalLoading(false);
			store.getState().setShowToast(true);
		} catch (error: any) {
			alert(error.message);
		}
	}

	const SavedSuccessfulToast = () => {
		const showToast = store((state) => state.showToast);
		const setShowToast = store.getState().setShowToast;

		return <Toast open={showToast} setOpen={setShowToast} title={"Profile saved"} />;
	};


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
					avatarName={profile.username || profile.id}
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
			<SavedSuccessfulToast/>
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
