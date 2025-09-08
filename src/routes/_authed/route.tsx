import { createFileRoute, redirect } from "@tanstack/react-router";
import { $getSession } from "@/functions";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ location, context, preload }) => {
		if (preload) {
			return
		}

		const { session } = await $getSession(context.queryClient);

		if (!session) {
			throw redirect({
				to: "/sign-in",
				search: {
					redirect: location.href,
				},
			})
		}

		return {
			session,
		}
	},
});
