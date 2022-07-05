import { keyframes, styled } from "@stitches/react";
import * as Dialog from "@radix-ui/react-dialog";
import theme from "@/styles/theme";

const overlayShow = keyframes({
	"0%": { opacity: 0 },
	"100%": { opacity: 1 },
});

const contentShow = keyframes({
	"0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
	"100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledOverlay = styled(Dialog.Overlay, {
	backgroundColor: theme.colors.overlayBg,
	position: "fixed",
	inset: 0,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
});

const StyledContent = styled(Dialog.Content, {
	backgroundColor: "white",
	borderRadius: 6,
	boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
	position: "fixed",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90vw",
	maxWidth: "450px",
	maxHeight: "85vh",
	padding: 25,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
	"&:focus": { outline: "none" },
});

export function Content({ children, ...props }) {
	return (
		<Dialog.Portal>
			<StyledOverlay />
			<StyledContent {...props}>{children}</StyledContent>
		</Dialog.Portal>
	);
}
