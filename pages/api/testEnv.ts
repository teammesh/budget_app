import { NextApiRequest, NextApiResponse } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	return res.status(200).json({ supabaseServiceKey, supabaseUrl });
}
