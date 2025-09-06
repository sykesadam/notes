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
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

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
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	// loader: ({ route }) => {
	// 	// Access the request from the server-side context
	// 	const cookies = context.req.raw.headers.get("Cookie");

	// 	// Parse the cookies to get a specific one
	// 	const userCookie = getCookie(cookies, "user");

	// 	return { userCookie };
	// },

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
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider>
					<SidebarProvider>
						<AppSidebar />

						<div className="w-7 sticky top-0 bottom-0 shrink-0 max-h-dvh flex sticky-0">
							<SidebarTrigger className="self-end md:self-start" />
						</div>
						{/* <Header /> */}
						{children}
					</SidebarProvider>
				</ThemeProvider>
				{/* <TanStackDevtools
					config={{
						position: "middle-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/> */}
				<Scripts />
			</body>
		</html>
	);
}
