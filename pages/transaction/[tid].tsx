import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { Main } from "@/components/Main";
import { Button } from "@/components/Button";
import theme from "@/styles/theme";
import { ArrowLeftIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { SharedTransaction } from "@/components/SharedTransaction";
import { verifyUser } from "@/utils/ssr";
import { RequestData } from "next/dist/server/web/types";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import * as Avatar from "@radix-ui/react-avatar";
import DefaultAvatar from "boring-avatars";

const Transaction = ({ data }: { data: any }) => {
	const router = useRouter();
	const profile_id = supabase.auth.session()?.user?.id;
	const transaction = data[0];
	const groupUsers = data[0].groups.profiles_groups;

	console.log(transaction);

	return (
		<Main>
			<div className={"grid grid-cols-1 gap-4"}>
				<div className={"flex justify-between"}>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						onClick={() => router.back()}
					>
						<ArrowLeftIcon />
						Return
					</Button>
					<Button
						size={"sm"}
						style={{ background: theme.colors.gradient.a }}
						// onClick={() => setShowManage(true)}
					>
						<MixerHorizontalIcon />
						Manage
					</Button>
				</div>
				<div>
					<SharedTransaction transaction={transaction} groupUsers={groupUsers} />
				</div>
				<div
					className={
						"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-4 items-center cursor-pointer"
					}
				>
					<div className="flex justify-between">
						<div className="font-medium text-sm">{transaction.location?.city || "City"}</div>
						<div className="font-medium text-sm capitalize">
							{transaction.payment_channel || "N/A"}
						</div>
					</div>
					<div></div>
					<div className="font-mono font-medium text-sm tracking-tight text-gray-600">
						{transaction?.category.map((c: any) => (
							<span key={c} className="mr-4">
								{c}
							</span>
						))}
					</div>
				</div>
				<div
					className={
						"p-3 rounded-md bg-gray-900 grid grid-cols-1 gap-4 items-center cursor-pointer"
					}
				>
					<div className={"grid grid-cols-1 gap-3"}>
						{groupUsers.map((user: any) => (
							<div
								key={user.profile_id}
								className={"grid grid-cols-[auto_1fr_auto] items-center text-sm gap-3"}
							>
								<Avatar.Root>
									<Avatar.Image />
									<Avatar.Fallback>
										<DefaultAvatar
											size={24}
											name={user.profiles.username}
											variant="beam"
											colors={theme.colors.avatar}
										/>
									</Avatar.Fallback>
								</Avatar.Root>
								<div>
									{user.profiles.username} {user.profile_id === profile_id && " (you)"}
								</div>
								<div className={"font-mono font-medium tracking-tighter"}>$XX</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</Main>
	);
};

export async function getServerSideProps({ req, params }: { req: RequestData; params: Params }) {
	const { props, redirect } = await verifyUser(req);
	const { tid } = params;

	const { data } = await supabase
		.from("shared_transactions")
		.select("*, groups( name, profiles_groups( *, profiles(id, username) ) )")
		.eq("id", tid);

	return { props: { ...props, data }, redirect };
}

export default Transaction;
