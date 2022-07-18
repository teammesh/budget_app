import { supabase } from "@/utils/supabaseClient";
import { NextApiResponse } from "next";

export const verifyUser = async (req: any, res: NextApiResponse) => {
	const { user, error: userError } = await supabase.auth.api.getUserByCookie(req, res);
	const { data: profiles } = await supabase.from("profiles").select().eq("id", user?.id);

	// If no user, redirect to index.
	if (!user) {
		if (userError?.message === "Invalid Refresh Token")
			return {
				props: {},
				redirect: { destination: "/login?session_expired=true", permanent: false },
			};
		return {
			props: {},
			redirect: { destination: "/login", permanent: false },
		};
	}

	// If no profile, redirect to create account
	if (profiles?.length === 0) {
		const { data, error } = await supabase.from("profiles").insert({ id: user.id });
		return { props: {}, redirect: { destination: "/account", permanent: false } };
	}

	const profile = profiles && profiles.length > 0 && profiles[0];

	// If there is a user, return it.
	return { props: { user, profile, userError } };
};
