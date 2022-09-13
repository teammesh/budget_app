import { createClient } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// @ts-ignore
export const supabase = createClient<definitions>(supabaseUrl, supabaseAnonKey);

export async function supabaseQuery(fn: any, enableLogging?: boolean) {
	const { data, error } = await fn();
	error && alert(`Error ${error.code}: ${error.message}`);
	enableLogging && console.log(data);
	return { data, error };
}
