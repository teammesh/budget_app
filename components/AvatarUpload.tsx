import theme from "@/styles/theme";
import { tempStore } from "@/utils/store";
import { supabase } from "@/utils/supabaseClient";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { Button } from "./Button";
import { ModalContent } from "./Modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Avatar } from "@/components/Avatar";
import { isNil } from "ramda";
import { Loading } from "./Loading";

export const AvatarUpload = ({
	avatarUrl,
	avatarName,
	avatarType,
	typeId,
}: {
	avatarUrl: string | any;
	avatarName: string | any;
	avatarType: string | any;
	typeId: string | any;
}) => {
	const [avatarFile, setAvatarFile] = useState();
	const [newAvatarURL, setNewAvatarURL] = useState(avatarUrl);
	const [localAvatarURL, setLocalAvatarURL] = useState(avatarUrl);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isNil(newAvatarURL)) return;
		if (avatarType === "profile") {
			const setUserAvatar = tempStore.getState().setAvatarUrl;
			setUserAvatar(newAvatarURL);
		} else if (avatarType === "group") {
			const setGroupAvatar = tempStore.getState().setGroupAvatarUrl;
			setGroupAvatar(newAvatarURL);
		}
	}, [avatarType, newAvatarURL]);

	const uploadToClient = (e: any) => {
		const newAvatarFile = e.target.files ? e.target.files[0] : null;
		if (newAvatarFile) {
			setAvatarFile(newAvatarFile);
			setLocalAvatarURL(URL.createObjectURL(newAvatarFile));
		} else {
			alert("Error with uploading");
		}
	};

	const uploadToServer = async (e: any) => {
		try {
			if (!avatarFile) {
				alert("No avatar selected");
				return;
			}

			setIsLoading(true);
			const filePath = `public/${avatarType}/${typeId}/${v4()}.jpg`;
			const { data, error } = await supabase.storage.from("avatars").upload(filePath, avatarFile);
			if (error) {
				throw error;
			}

			const { data: publicAvatarURL }: any = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			if (avatarType === "profile") {
				const { error } = await supabase
					.from("profiles")
					.update({ avatar_url: publicAvatarURL.publicURL })
					.eq("id", typeId);
				if (error) {
					throw error;
				}
			}

			if (avatarType === "group") {
				const { error } = await supabase
					.from("groups")
					.update({ avatar_url: publicAvatarURL.publicURL })
					.eq("id", typeId);
				if (error) {
					throw error;
				}
			}
			setNewAvatarURL(publicAvatarURL?.publicURL);
			setIsLoading(false);
		} catch (error: any) {
			alert(error.message);
		}
	};

	return (
		<div className="place-self-center">
			{isLoading ? (
				<Loading />
			) : (
				<Avatar avatarName={avatarName} avatarUrl={newAvatarURL} size={128} variant={"beam"} />
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
							<Avatar
								avatarName={avatarName}
								avatarUrl={localAvatarURL}
								size={128}
								variant={"beam"}
							/>
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
