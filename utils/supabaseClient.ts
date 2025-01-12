import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);

export async function supabaseQuery(fn: any, enableLogging?: boolean) {
	const { data, error } = await fn();
	error && alert(`Error ${error.code}: ${error.message}`);
	enableLogging && console.log(data);
	return { data, error };
}
