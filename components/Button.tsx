import { forwardRef } from "react";

export const Button = forwardRef(
	(
		{
			children,
			size,
			style,
			background,
			border,
			onClick,
			disabled,
			...props
		}: {
			children: any;
			size: "sm" | "md";
			props?: any;
			style?: any;
			background?: any;
			border?: any;
			onClick?: any;
			disabled?: boolean;
		},
		ref,
	) => (
		<button
			className={"p-0.5 rounded-full text-sm"}
			style={
				disabled
					? style
					: background
					? { ...style, background }
					: border
					? { ...style, background: border }
					: style
			}
			// @ts-ignore
			ref={ref}
			onClick={() => {
				if (disabled) return;
				onClick();
			}}
			{...props}
		>
			<div
				className={`grid grid-cols-[auto_auto] gap-2 items-center justify-center font-medium h-10 px-4 leading-none rounded-full 
				${!background && " bg-black"} ${disabled && "bg-gray-700 text-gray-800 cursor-not-allowed"}`}
			>
				{children}
			</div>
		</button>
	),
);
