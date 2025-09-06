import { Link } from "@tanstack/react-router";
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
import { ModeToggle } from "./mode-toggle";

const items = [
	{
		title: "Notes",
		url: "/notes",
		icon: NotebookText,
	},
];
const notes = [
	{
		title: "Najs",
		id: "wzZDMM_zlH7pRs_hX9Btr",
		// icon: NotebookText,
	},
] as const;

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Recent notes</SidebarGroupLabel>
					<SidebarGroupAction title="Add note">
						<Plus />
						<span className="sr-only">Add note</span>
					</SidebarGroupAction>
					<SidebarGroupContent>
						<SidebarMenu>
							{notes.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link
											to="/notes/$notesId"
											params={{
												notesId: item.id,
											}}
										>
											{item.title}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
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
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className="flex justify-end">
						<ModeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			{/* <SidebarRail /> */}
		</Sidebar>
	);
}
