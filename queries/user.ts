import { Prisma } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';

export function getUser(client: SupabaseClient, userId: string) {
	if (!userId) {
		return Promise.resolve({ data: null });
	}
	return client.from('User').select().eq('user_id', userId).throwOnError().single();
}

export function updateUser(client: SupabaseClient, user: Prisma.UserUncheckedUpdateInput) {
	return client.from('User').upsert(user).select();
}
