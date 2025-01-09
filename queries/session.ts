import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function getSession() {
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		throw error;
	} else {
		return data.session;
	}
}

export async function signOut() {
	return supabase.auth.signOut();
}

export async function loginEmail(client: SupabaseClient, email: string) {
	return client.auth.signInWithOtp({
		email,
		options: { emailRedirectTo: "https://sondr.netlify.app" },
	});
}
