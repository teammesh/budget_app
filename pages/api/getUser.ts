import { supabase } from "@/utils/supabaseClient";
import { RequestData } from "next/dist/server/web/types";
import { NextApiResponse } from "next";

const getUser = async (req: RequestData, res: NextApiResponse) => {
	const token = req.headers.token;

	// @ts-ignore
	const { data: user, error } = await supabase.auth.api.getUser(token);

	if (error) return res.status(500).json({ error: error.message });
	return res.status(200).json(user);
};

export default getUser;
