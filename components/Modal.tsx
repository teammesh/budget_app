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
	zIndex: 40,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
	backdropFilter: "blur(16px)",
});

const StyledContent = styled(Dialog.Content, {
	boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
	position: "fixed",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90vw",
	maxWidth: "450px",
	maxHeight: "85vh",
	zIndex: 50,
	"@media (prefers-reduced-motion: no-preference)": {
		animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
	},
	"&:focus": { outline: "none" },
});

const StyledGradientCont = styled("div", {
	position: "absolute",
	width: "100%",
	height: "100%",
	opacity: "0.3",
	zIndex: -1,
});

const StyledGradientA = styled("div", {
	position: "absolute",
	width: "264.74px",
	height: "264.74px",
	top: -20,
	right: -20,
	background: "linear-gradient(180deg, #F22FB0 0%, rgba(245, 138, 37, 0) 100%, #7061A3 100%)",
	filter: "blur(40px)",
});

const StyledGradientB = styled("div", {
	position: "absolute",
	width: "361.81px",
	height: "361.81px",
	bottom: -40,
	left: -40,
	background: "linear-gradient(180deg, #FF7BCA 0%, rgba(255, 197, 111, 0.46) 100%)",
	filter: "blur(60px)",
});

const StyledChildren = styled("div", {
	background: "rgba(0,0,0,0.7)",
});

export function Content({ children, ...props }: { children: any }) {
	return (
		<Dialog.Portal>
			<StyledOverlay />
			<StyledContent className={"relative"} {...props}>
				<StyledGradientCont>
					<StyledGradientA />
					<StyledGradientB />
				</StyledGradientCont>
				<StyledChildren className={"rounded-3xl p-6 grid grid-cols-1 gap-8 z-10"}>
					{children}
				</StyledChildren>
			</StyledContent>
		</Dialog.Portal>
	);
}
