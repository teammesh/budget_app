import Groups from "@/pages/groups";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/Main";
import { supabase } from "@/utils/supabaseClient";
import { sessionStore } from "@/utils/store";

export default function Home({ user, profile }) {
	return (
		<Main profile={profile}>
			<Groups profile={profile} />
			<Navbar />
		</Main>
	);
}
export async function getServerSideProps({ req }) {
	const { user } = await supabase.auth.api.getUserByCookie(req);
	const { data, error } = await supabase.from("profiles").select().eq("id", user?.id);

	// If no user, redirect to index.
	if (!user) {
		return { props: {}, redirect: { destination: "/login", permanent: false } };
	}

	// If no profile, redirect to create account
	if (data?.length === 0) {
		const { data, error } = await supabase.from("profiles").insert({ id: user.id });
		return { props: {}, redirect: { destination: "/account", permanent: false } };
	}

	// If there is a user, return it.
	return { props: { user, profile: data[0] } };
}
