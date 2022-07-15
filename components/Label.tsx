export const Label = ({ children, htmlFor }: { children: any; htmlFor?: any }) => (
	<label className={"font-medium font-mono text-sm tracking-tight"} htmlFor={htmlFor}>
		{children}
	</label>
);
