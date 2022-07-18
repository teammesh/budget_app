import Image from "next/image";
import DefaultAvatar from "boring-avatars";
import theme from "@/styles/theme";

export const Avatar = ({
	avatarUrl,
	avatarName,
    size = 32,
	variant = "beam",
}: {
	avatarUrl: string;
	avatarName: string;
    size?: number;
	variant?: string;
}) => (
	<>
		{avatarUrl ? (
			<Image
				src={avatarUrl}
				className={"w-12 h-12 rounded-full"}
				height={size}
				width={size}
				alt={`${avatarName}'s avatar`}
			/>
		) : (
			<DefaultAvatar size={size} name={avatarName} variant={variant} colors={theme.colors.avatar} />
		)}
	</>
);
