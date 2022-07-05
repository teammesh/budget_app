import { useState, useEffect, useRef } from "react";
import { supabase, supabaseQuery } from "@/utils/supabaseClient";
import { displayAmount } from "@/components/Amount";
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import { tempStore } from "@/utils/store";
import { isNil } from "ramda";

export default function Groups() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const initialRef = useRef(null);
	const finalRef = useRef(null);

	const profile_id = supabase.auth.session()?.user?.id;
	const [groupName, setGroupName] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const groups = tempStore((state) => state.groups);
	const setGroups = tempStore.getState().setGroups;

	useEffect(() => {
		const findGroups = async () => {
			const { data } = await supabaseQuery(
				() =>
					supabase
						.from("profiles_groups")
						.select("group_id, groups(name)")
						.eq("profile_id", profile_id),
				true,
			);
			setGroups(data);
		};

		supabase
			.from(`profiles_groups:profile_id=eq.${supabase.auth.session()?.user?.id}`)
			.on("*", (payload) => {
				console.log("Change received!", payload);
				findGroups();
			})
			.subscribe();

		findGroups();
	}, []);

	const amountTotal = -2200;

	const handleCreateGroup = async () => {
		// Create group
		const { data: groupsData, error } = await supabase.from("groups").insert([{ name: groupName }]);

		// Attach current user to group
		const { data: profileData } = await supabase
			.from("profiles_groups")
			.insert({ group_id: groupsData[0].id, profile_id: supabase.auth.session()?.user?.id })
			.select("*, profiles(username)");

		// Get profile_ids of invitees
		const tmp = await Promise.all(
			members.map(async (member) => {
				if (profileData[0].profiles.username === member) return;

				const { data: memberData } = await supabase
					.from("profiles")
					.select()
					.eq("username", member);

				if (memberData?.length > 0)
					return { group_id: groupsData[0].id, profile_id: memberData[0].id };
				else console.error(`user: ${member} not found`);
			}),
		);
		const req = tmp.filter((x) => !isNil(x));

		// Add profiles_groups entry for invitees
		if (req.length > 0) {
			await supabaseQuery(() => supabase.from("profiles_groups").insert(req), true);
		}
	};

	return (
		<div className="flex flex-col">
			<div className="flex flex-col items-center">
				<div className="text-lg">{amountTotal < 0 ? "You owe" : "Your pending refund"}</div>
				<div className="pt-2 text-4xl">{displayAmount(amountTotal)}</div>
			</div>
			<div className="pt-20">
				<div className="text-lg text-gray-300">Your groups</div>
			</div>
			<div className="pt-6">
				{groups.length > 0 ? (
					<div className="flex flex-col">
						{groups.map((group) => (
							<div key={group.groups.name} className="pt-5">
								<Link href={`/group/${group.group_id}`}>
									<div className="flex ">
										<div className="flex-initial pr-1">Avatar</div>
										<div className="flex-grow flex flex-col">
											<div className="text-xl">{group.groups.name}</div>
										</div>
										{/*<div className="text-xl text-right">{displayAmount(group.amount)}</div>*/}
									</div>
								</Link>
							</div>
						))}
					</div>
				) : (
					<div>You are currently not in any groups</div>
				)}
			</div>
			<div className="flex justify-center">
				<Button onClick={onOpen}>Create Group</Button>
			</div>

			<Modal
				initialFocusRef={initialRef}
				finalFocusRef={finalRef}
				isOpen={isOpen}
				onClose={onClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Create group</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<FormLabel>Group name</FormLabel>
							<Input
								ref={initialRef}
								placeholder="Group name"
								onChange={(e) => setGroupName(e.target.value)}
							/>
						</FormControl>

						<FormControl mt={4}>
							<FormLabel>Members</FormLabel>
							<Input
								placeholder="Members"
								onChange={(e) => setMembers(e.target.value.split(","))}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							onClick={() => {
								handleCreateGroup();
								onClose();
							}}
						>
							Save
						</Button>
						<Button onClick={onClose}>Cancel</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
