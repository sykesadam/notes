import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();

	if (!session || !("user" in session)) return <p>NOPE</p>;

	const logOut = async () => {
		const { data } = await authClient.signOut();

		if (data) {
			navigate({ to: "/" });
		}
	};

	return (
		<div className="pl-0 pr-4 md:pl-4 py-12 flex flex-col items-center justify-center max-w-4xl w-full mx-auto gap-4">
			<h1 className="text-2xl md:text-4xl font-bold">Profile</h1>

			<div>Hello {session.user.email}!</div>

			<Button type="button" onClick={logOut}>
				LOGGA UT
			</Button>
		</div>
	);
}
