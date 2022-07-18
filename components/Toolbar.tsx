import { createRef } from "react";

export const toolbarRef = createRef<HTMLDivElement>();

export const Toolbar = ({ children }: { children?: any }) => {
	return (
		<div ref={toolbarRef} className={"bg-black-500 w-full p-3 pb-0"}>
			{children}
		</div>
	);
};
