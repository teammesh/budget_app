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

export default function Groups() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const initialRef = useRef(null);
	const finalRef = useRef(null);

	const profile_id = supabase.auth.session()?.user?.id;
	const [groupName, setGroupName] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [userGroups, setUserGroups] = useState([]);

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
			setUserGroups(data);
		};

		findGroups();
	}, []);

	const amountTotal = -2200;

	const handleCreateGroup = async () => {
		try {
			// setLoading(true);

			// Create group
			const { data: groupsData, error } = await supabase
				.from("groups")
				.insert([{ name: groupName }]);

			// Attach current user to group
			const { data: profileData, error: profileError } = await supabase
				.from("profiles_groups")
				.insert({ group_id: groupsData[0].id, profile_id: supabase.auth.session()?.user?.id });

			// Update list of groups in page
			// setGroups(profileData[0].groups);

			// Update members' group list
			const req = [];
			members.map(async (member) => {
				console.log(member);
				const { data: memberData } = await supabase
					.from("profiles")
					.select()
					.eq("username", member);

				req.push({ group_id: groupsData[0].id, profile_id: memberData[0].id });
			});

			if (req.length > 0) await supabase.from("profiles_group").insert(req);

			if (error) throw error;
			alert("Group created!");
		} catch (error) {
			alert(error.error_description || error.message);
		} finally {
			// setLoading(false);
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
				{userGroups.length > 0 ? (
					<div className="flex flex-col">
						{userGroups.map((group) => (
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
