import theme from "@/styles/theme";
import { Metronome } from "@uiball/loaders";

export const Loading = () => (
	<div
		className={
			"fixed top-0 bottom-0 left-0 right-0 z-50 grid grid-cols-1 gap-2 content-center place-items-center"
		}
		style={{
			background: theme.colors.overlayBg,
		}}
	>
		<Metronome size={40} speed={1.6} color="white" />
		<div className={""}>Loading...</div>
	</div>
);
