import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/Main";
import { Input } from "@/components/Input";
import { verifyUser } from "@/utils/ssr";
import { AuthUser } from "@supabase/supabase-js";
import { definitions } from "../types/supabase";
import { RequestData } from "next/dist/server/web/types";

export default function Account({
	user,
	profile,
}: {
	user: AuthUser;
	profile: definitions["profiles"];
}) {
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState<string>("");
	const [website, setWebsite] = useState<string>("");
	const [avatar_url, setAvatarUrl] = useState<string>("");

	useEffect(() => {
		getProfile();
	}, []);

	async function getProfile() {
		try {
			setLoading(true);

			const { data, error, status } = await supabase
				.from("profiles")
				.select(`username, website, avatar_url`)
				.eq("id", user.id)
				.single();

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				setUsername(data.username);
				setWebsite(data.website);
				setAvatarUrl(data.avatar_url);
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	}

	async function updateProfile({
		username,
		website,
		avatar_url,
	}: {
		username: string;
		website: string;
		avatar_url: string;
	}) {
		try {
			setLoading(true);

			const updates = {
				id: user.id,
				username,
				website,
				avatar_url,
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates, {
				returning: "minimal", // Don't return the value after inserting
			});

			if (error) {
				throw error;
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Main>
			<Navbar />
			<div className="form-widget">
				<div>
					<label htmlFor="email">Email</label>
					<Input id="email" type="text" value={user.email} disabled />
				</div>
				<div>
					<label htmlFor="username">Name</label>
					<Input
						id="username"
						type="text"
						value={username || ""}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div>
					<label htmlFor="website">Website</label>
					<Input
						id="website"
						type="website"
						value={website || ""}
						onChange={(e) => setWebsite(e.target.value)}
					/>
				</div>

				<div>
					<button
						className="button block primary"
						onClick={() => updateProfile({ username, website, avatar_url })}
						disabled={loading}
					>
						{loading ? "Loading ..." : "Update"}
					</button>
				</div>

				<div>
					<button
						className="button block"
						onClick={async () => {
							const access_token = supabase.auth.session()?.access_token;
							if (!access_token) return;
							await supabase.auth.api.signOut(access_token);
							await supabase.auth.signOut();
						}}
					>
						Sign Out
					</button>
				</div>
			</div>
		</Main>
	);
}

export async function getServerSideProps({ req }: { req: RequestData }) {
	return verifyUser(req);
}
