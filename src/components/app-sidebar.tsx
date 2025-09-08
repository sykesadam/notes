import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { NotebookText, Plus } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import {
	createNoteMutationOptions,
	getNotesQueryOptions,
} from "@/lib/query-options";
import { ModeToggle } from "./mode-toggle";
import { ProfileButton } from "./profile-button";

const items = [
	{
		title: "Notes",
		url: "/notes",
		icon: NotebookText,
	},
] as const;

export function AppSidebar() {
	const navigate = useNavigate();
	const { data, isPending } = useQuery(getNotesQueryOptions());
	const { mutate: createNote } = useMutation(createNoteMutationOptions());

	const createNoteHandler = async () => {
		// const name = prompt("Enter note name:");

		createNote(
			{},
			{
				onSuccess: (data) => {
					navigate({
						to: "/notes/$notesId",
						params: {
							notesId: data.id,
						},
					});
				},
			},
		);
	};

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Recent notes</SidebarGroupLabel>
					<SidebarGroupAction title="Add note" onClick={createNoteHandler}>
						<Plus />
						<span className="sr-only">Add note</span>
					</SidebarGroupAction>
					<SidebarGroupContent>
						<SidebarMenu>
							{isPending ? <SidebarMenuItem>Loading...</SidebarMenuItem> : null}
							{data
								? data.map((item) => (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton asChild>
												<Link
													to="/notes/$notesId"
													params={{
														notesId: item.id,
													}}
												>
													{item.name}
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))
								: null}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarSeparator />
				<SidebarGroup>
					{/* <SidebarGroupLabel></SidebarGroupLabel> */}
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className="flex justify-end gap-2">
						<ProfileButton />
						<ModeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
}
