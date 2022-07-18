import { supabase } from "@/utils/supabaseClient";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";
import { tempStore } from "@/utils/store";
import { Button } from "@/components/Button";
import { useState } from "react";
import theme from "@/styles/theme";
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { Field } from "@/components/Field";
import { Label } from "@/components/Label";
import Image from "next/image";
import DefaultAvatar from "boring-avatars";
import * as Dialog from "@radix-ui/react-dialog";
import { ModalContent } from "@/components/Modal";
import { v4 } from "uuid";
import { Content } from "@/components/Main";

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
				<Avatar />
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
		</Content>
	);
}

const Avatar = () => {
	const profile_id = supabase.auth.session()?.user?.id;
	const avatar_url = tempStore((state) => state.avatarUrl);
	const set_avatar_url = tempStore.getState().setAvatarUrl;
	const username = tempStore((state) => state.username);
	const [userAvatar, setUserAvatar] = useState(avatar_url);
	const [userAvatarURL, setUserAvatarURL] = useState(avatar_url);

	const uploadToClient = (e: any) => {
		setUserAvatar("");
		setUserAvatarURL("");
		const avatar = e.target.files ? e.target.files[0] : null;
		if (avatar) {
			setUserAvatar(avatar);
			setUserAvatarURL(URL.createObjectURL(avatar));
		} else {
			alert("Error with uploading user avatar");
		}
	};

	const uploadToServer = async (e: any) => {
		try {
			const filePath = `public/${profile_id}/${v4()}.jpg`;
			const { data, error } = await supabase.storage.from("avatars").upload(filePath, userAvatar, {
				upsert: true,
			});
			if (error) {
				throw error;
			}

			const { data: publicAvatarURL }: any = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			const { error: profileUpdateError } = await supabase
				.from("profiles")
				.update({ avatar_url: publicAvatarURL.publicURL })
				.eq("id", profile_id);
			if (profileUpdateError) {
				throw profileUpdateError;
			}
			set_avatar_url(publicAvatarURL?.publicURL);
		} catch (error: any) {
			alert(error.message);
		}
	};

	return (
		<div className="place-self-center">
			{avatar_url ? (
				<Image
					src={avatar_url}
					className={"w-12 h-12 rounded-full"}
					height={128}
					width={128}
					alt={"from user avatar"}
				/>
			) : (
				<DefaultAvatar size={128} name={username} variant="beam" colors={theme.colors.avatar} />
			)}
			<div className="mt-3">
				<Dialog.Root>
					<Dialog.Trigger asChild>
						<Button size={"sm"} background={theme.colors.gradient.a}>
							Upload avatar
						</Button>
					</Dialog.Trigger>
					<ModalContent>
						<div className={"grid grid-cols-1 gap-2 text-center"}>
							<Dialog.Title className={"font-medium text-md"}>Upload avatar</Dialog.Title>
						</div>
						<div className="place-self-center">
							{userAvatarURL ? (
								<Image
									src={userAvatarURL}
									className={"w-12 h-12 rounded-full"}
									height={128}
									width={128}
									alt={"from user avatar"}
								/>
							) : (
								<DefaultAvatar
									size={128}
									name={username}
									variant="beam"
									colors={theme.colors.avatar}
								/>
							)}
						</div>
						<input type="file" name="avatar" onChange={uploadToClient} />
						<div className={"grid grid-cols-1 gap-2"}>
							<Dialog.Close asChild>
								<Button size={"sm"} border={theme.colors.gradient.a}>
									<ArrowLeftIcon />
									Cancel
								</Button>
							</Dialog.Close>
							<Dialog.Close asChild>
								<Button size={"sm"} background={theme.colors.gradient.a} onClick={uploadToServer}>
									Upload
								</Button>
							</Dialog.Close>
						</div>
					</ModalContent>
				</Dialog.Root>
			</div>
		</div>
	);
};

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
