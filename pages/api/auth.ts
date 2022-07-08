import { supabase } from "@/utils/supabaseClient";
import { RequestData } from "next/dist/server/web/types";
import { NextApiResponse } from "next";

export default function handler(req: RequestData, res: NextApiResponse) {
	return supabase.auth.api.setAuthCookie(req, res);
}
