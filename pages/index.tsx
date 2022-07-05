import Auth from "@/components/Auth";
import Groups from "@/pages/groups";
import { sessionStore } from "@/utils/store";

export default function Home() {
	const session = sessionStore((state) => state.session);

	return (
		<div className="md:container md:mx-auto md:max-w-2xl pt-20">
			{/* {!session ? <Auth /> : <Account key={session.user.id} session={session} />} */}
			{!session ? <Auth /> : <Groups />}
		</div>
	);
}
