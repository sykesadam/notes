import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
	getNoteQueryOptions,
	getNotesQueryOptions,
	useBackgroundSync,
} from "@/lib/query-options";
import { getClientCookie } from "@/lib/utils";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

let didHydrateNotes = false;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Notes",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	ssr: false,

	beforeLoad: async ({ context }) => {
		const { queryClient } = context;

		if (!didHydrateNotes) {
			const notes = await queryClient.ensureQueryData(getNotesQueryOptions());
			for (const note of notes) {
				queryClient.setQueryData(getNoteQueryOptions(note.id).queryKey, note);
			}
			didHydrateNotes = true;
		}
	},

	loader: () => {
		const sidebar_state = getClientCookie("sidebar_state") === "true";

		return {
			sidebar_state,
		};
	},

	shellComponent: RootDocument,

	notFoundComponent: () => <div>404 - Not Found</div>,

	errorComponent: ({ error }) => (
		<div>
			<h1>Error</h1>
			<pre>{error.message}</pre>
		</div>
	),
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const data = Route.useLoaderData();

	useBackgroundSync();

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<SidebarProvider defaultOpen={data?.sidebar_state ?? false}>
						<AppSidebar />

						<div className="w-7 sticky top-0 bottom-0 shrink-0 max-h-dvh flex sticky-0">
							<SidebarTrigger className="self-end md:self-start" />
						</div>
						{children}
					</SidebarProvider>
				</ThemeProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
