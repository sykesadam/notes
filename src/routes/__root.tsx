import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { $getSession, $getSidebarState, $getThemeState } from "@/functions";
import { hydrateNotesFromDB } from "@/lib/hydrateAppState";
import { useBackgroundSync } from "@/lib/query-options";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

export interface RouterContext {
	queryClient: QueryClient;
	session: null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
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

	beforeLoad: async ({ context }) => {
		if (typeof window !== "undefined") {
			await hydrateNotesFromDB(context.queryClient);
		}

		return {
			session: await $getSession(context.queryClient),
			sidebarState: $getSidebarState(),
			themeState: $getThemeState() || undefined,
		};
	},

	shellComponent: RootShell,

	component: RootComponent,

	notFoundComponent: () => <div>404 - Not Found</div>,

	pendingComponent: () => <div>Loading bby</div>,

	errorComponent: ({ error }) => (
		<div>
			<h1>Error {error.name}</h1>
			<pre>{error.message}</pre>
		</div>
	),
});

function RootShell({ children }: { children: React.ReactNode }) {
	const { sidebarState, themeState = "dark" } = Route.useRouteContext();

	console.log("themeState", themeState);

	return (
		<html lang="en" className={themeState}>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme={themeState}>
					<SidebarProvider defaultOpen={sidebarState}>
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

function RootComponent() {
	const { session } = Route.useRouteContext();

	useBackgroundSync(!!session.session);

	return <Outlet />;
}
