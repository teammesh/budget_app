import { AvatarUpload } from "./AvatarUpload";

export const ProfileAvatarUpload = ({
	avatarUrl,
	avatarName,
	profileId,
}: {
	avatarUrl: string;
	avatarName: string;
	profileId: string | any;
}) => {
	return (
		<AvatarUpload
			avatarUrl={avatarUrl}
			avatarName={avatarName}
			avatarType="profile"
			typeId={profileId}
		/>
	);
};
