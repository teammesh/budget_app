import { motion } from "framer-motion";
import { forwardRef } from "react";

export const PrimaryBox = forwardRef(({ children, ...props }: { children?: any }, ref) => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={"p-3 rounded-md bg-gray-900 cursor-pointer grid grid-cols-1 gap-0.5 text-sm"}
			// @ts-ignore
			ref={ref}
			{...props}
		>
			{children}
		</motion.div>
	);
});

export const FormBox = ({ children }: { children?: any }) => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={"p-5 rounded-md bg-gray-900 grid grid-cols-1 gap-6 items-center cursor-pointer"}
		>
			{children}
		</motion.div>
	);
};
