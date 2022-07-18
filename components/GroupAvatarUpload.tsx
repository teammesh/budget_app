import { AvatarUpload } from "./AvatarUpload";

export const GroupAvatarUpload = ({
	avatarUrl,
	avatarName,
	groupId,
}: {
	avatarUrl: string;
	avatarName: string;
	groupId: string | any,
}) => {
    return (
        <AvatarUpload 
            avatarUrl={avatarUrl}
            avatarName={avatarName}
            avatarType="group"
            typeId={groupId}
        />
    );
};