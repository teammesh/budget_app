import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Navbar } from "@/components/Navbar";
import { Main } from "@/components/Main";
import { Input } from "@/components/Input";

export default function Account({ user, profile }) {
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState(null);
	const [website, setWebsite] = useState(null);
	const [avatar_url, setAvatarUrl] = useState(null);

	useEffect(() => {
		getProfile();
	}, []);

	async function getProfile() {
		try {
			setLoading(true);
			const user = supabase.auth.user();

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
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	}

	async function updateProfile({ username, website, avatar_url }) {
		try {
			setLoading(true);
			const user = supabase.auth.user();

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
		} catch (error) {
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
							await supabase.auth.api.signOut(supabase.auth.session()?.access_token);
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

export async function getServerSideProps({ req }) {
	const { user } = await supabase.auth.api.getUserByCookie(req);
	const { data, error } = await supabase.from("profiles").select().eq("id", user?.id);

	// If no user, redirect to index.
	if (!user) {
		return { props: {}, redirect: { destination: "/login", permanent: false } };
	}

	// If no profile, redirect to create account
	if (data?.length === 0) {
		const { data, error } = await supabase.from("profiles").insert({ id: user.id });
		return { props: {}, redirect: { destination: "/account", permanent: false } };
	}

	// If there is a user, return it.
	return { props: { user, profile: data[0] } };
}
