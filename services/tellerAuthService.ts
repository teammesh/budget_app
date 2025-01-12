import { supabase } from "@/utils/supabaseClient";
import { tempStore } from "@/utils/store";
import * as R from "ramda";
import { definitions } from "@/types/supabase";

export const fetchTellerAuth = async () => {
	const profile_id = supabase.auth.session()?.user?.id;

	try {
		const { data, error } = await supabase
			.from<definitions["teller_auth"]>("teller_auth")
			.select()
			.eq("profile_id", profile_id);

		if (error) throw error;

		if (data && !R.isEmpty(data)) {
			const indexedData = R.indexBy(R.prop("enrollment_id"), data);
			tempStore.getState().setTellerAuth(indexedData);
			return indexedData;
		}

		return {};
	} catch (error) {
		console.error("Error fetching accounts:", error);
		return {};
	}
};
