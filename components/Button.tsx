import { forwardRef } from "react";

export const Button = forwardRef(
	(
		{
			children,
			size,
			style,
			background,
			...props
		}: {
			children: any;
			size: "sm" | "md";
			props?: any;
			style?: any;
			background?: any;
		},
		ref,
	) => (
		<button
			className={"p-0.5 bg-amber-200 rounded-full text-sm"}
			style={background ? { ...style, background } : style}
			ref={ref}
			{...props}
		>
			<div
				className={`grid grid-cols-[auto_auto] gap-2 items-center font-medium h-10 px-4 rounded-full${
					!background && " bg-black"
				}`}
			>
				{" "}
				{children}
			</div>
		</button>
	),
);
