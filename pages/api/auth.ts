import { supabase } from "@/utils/supabaseClient";

export default function handler(req, res) {
	return supabase.auth.api.setAuthCookie(req, res);
}
