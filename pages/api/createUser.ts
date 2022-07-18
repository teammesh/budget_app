import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
// @ts-ignore
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { email } = req.body;

	const { data: user, error } = await supabaseService.auth.api.createUser({
		email,
		email_confirm: true,
		password: "databento0618",
	});

	if (!user) return res.status(401).json({ error });

	const { data, error: profilesError } = await supabaseService
		.from("profiles")
		.insert({ id: user.id });

	res.status(200).json({ user, error });
}
