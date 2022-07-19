import { AvatarUpload } from "./AvatarUpload";

export const ProfileAvatarUpload = ({
	avatarUrl,
	avatarName,
	profileId,
}: {
	avatarUrl: string | any;
	avatarName: string | any;
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
