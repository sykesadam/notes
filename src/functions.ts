import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import type { RouterContext } from "@/routes/__root";
import { SIDEBAR_COOKIE_NAME } from "./components/ui/sidebar";
import { auth } from "./lib/auth";
import { authClient } from "./lib/auth-client";
import { getClientCookie } from "./lib/utils";

export const $getSession = createIsomorphicFn()
	.client(async (queryClient: RouterContext["queryClient"]) => {
		const { data: session } = await queryClient.ensureQueryData({
			queryFn: () => authClient.getSession(),
			queryKey: ["auth", "getSession"],
			staleTime: 60_000, // cache for 1 minute
			revalidateIfStale: true, // fetch in background when stale
		});

		return {
			session,
		};
	})
	.server(async (_: RouterContext["queryClient"]) => {
		const request = getRequest();

		if (!request?.headers) {
			return { session: null };
		}

		const session = await auth.api.getSession({
			headers: request.headers,
		});

		return {
			session,
		};
	});

export const $getSidebarState = createIsomorphicFn()
	.client(() => {
		const sidebarState = getClientCookie(SIDEBAR_COOKIE_NAME);

		return sidebarState === "true";
	})
	.server(() => {
		const sidebarState = getCookie(SIDEBAR_COOKIE_NAME);

		return sidebarState === "true";
	});

export const $getThemeState = createIsomorphicFn()
	.client(() => {
		return getClientCookie("vite-ui-theme") as "dark" | "light" | null;
	})
	.server(() => {
		return getCookie("vite-ui-theme") as "dark" | "light" | null;
	});
