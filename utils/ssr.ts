import { supabase } from "@/utils/supabaseClient";

export const verifyUser = async (req: any) => {
	const { user } = await supabase.auth.api.getUserByCookie(req);
	const { data: profiles } = await supabase.from("profiles").select().eq("id", user?.id);

	// If no user, redirect to index.
	if (!user) {
		return { props: {}, redirect: { destination: "/login", permanent: false } };
	}

	// If no profile, redirect to create account
	if (profiles?.length === 0) {
		const { data, error } = await supabase.from("profiles").insert({ id: user.id });
		return { props: {}, redirect: { destination: "/account", permanent: false } };
	}

	// If there is a user, return it.
	return { props: { user, profile: profiles[0] } };
};
