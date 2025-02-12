import * as React from "react";
import { keyframes, styled } from "@stitches/react";
import * as ToastPrimitive from "@radix-ui/react-toast";

const VIEWPORT_PADDING = 25;

const hide = keyframes({
	"0%": { opacity: 1 },
	"100%": { opacity: 0 },
});

const slideIn = keyframes({
	from: { transform: `translateX(calc(100% + ${VIEWPORT_PADDING}px))` },
	to: { transform: "translateX(0)" },
});

const swipeOut = keyframes({
	from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
	to: { transform: `translateX(calc(100% + ${VIEWPORT_PADDING}px))` },
});

const StyledViewport = styled(ToastPrimitive.Viewport, {
	position: "fixed",
	bottom: 0,
	right: 0,
	display: "flex",
	flexDirection: "column",
	padding: VIEWPORT_PADDING,
	gap: 10,
	width: 390,
	maxWidth: "100vw",
	margin: 0,
	listStyle: "none",
	zIndex: 2147483647,
	outline: "none",
});

const StyledToast = styled(ToastPrimitive.Root, {
	display: "grid",
	gridTemplateAreas: "'title action' 'description action'",
	gridTemplateColumns: "auto max-content",
	columnGap: 15,
	alignItems: "center",

	"@media (prefers-reduced-motion: no-preference)": {
		"&[data-state='open']": {
			animation: `${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
		},
		"&[data-state='closed']": {
			animation: `${hide} 100ms ease-in forwards`,
		},
		"&[data-swipe='move']": {
			transform: "translateX(var(--radix-toast-swipe-move-x))",
		},
		"&[data-swipe='cancel']": {
			transform: "translateX(0)",
			transition: "transform 200ms ease-out",
		},
		"&[data-swipe='end']": {
			animation: `${swipeOut} 100ms ease-out forwards`,
		},
	},
});

const StyledTitle = styled(ToastPrimitive.Title, {
	gridArea: "title",
	marginBottom: 5,
	fontWeight: 500,
	fontSize: 15,
});

const StyledDescription = styled(ToastPrimitive.Description, {
	gridArea: "description",
	margin: 0,
	fontSize: 13,
	lineHeight: 1.3,
});

const StyledAction = styled(ToastPrimitive.Action, {
	gridArea: "action",
});

// Exports
export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = StyledViewport;
export const Toast = StyledToast;
export const ToastTitle = StyledTitle;
export const ToastDescription = StyledDescription;
export const ToastAction = StyledAction;
export const ToastClose = ToastPrimitive.Close;

// Your app...
const ToastDemo = ({
	open,
	setOpen,
	title,
	description,
}: {
	open: boolean;
	setOpen: any;
	title: string;
	description?: string;
}) => {
	const eventDateRef = React.useRef(new Date());
	const timerRef = React.useRef(0);

	React.useEffect(() => {
		return () => clearTimeout(timerRef.current);
	}, []);

	return (
		<ToastProvider swipeDirection="right">
			<Toast open={open} onOpenChange={setOpen} className={"p-4 rounded-md bg-gray-900"}>
				<ToastTitle className={"text-white"}>{title}</ToastTitle>
				{description && (
					<ToastDescription className={"text-gray-500"}>{description}</ToastDescription>
				)}
			</Toast>
			<ToastViewport />
		</ToastProvider>
	);
};

function prettyDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(date);
}

export default ToastDemo;
