import { Link } from "@tanstack/react-router";
import { LogIn, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function ProfileButton() {
	const { data, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<Button variant="outline" size="icon" asChild disabled>
				<Link to="/profile">
					<User />
				</Link>
			</Button>
		);
	}

	if (data?.user) {
		return (
			<Button variant="outline" size="icon" asChild>
				<Link to="/profile">
					<User />
				</Link>
			</Button>
		);
	}

	return (
		<Button variant="outline" size="icon" asChild>
			<Link to="/sign-in">
				<LogIn />
			</Link>
		</Button>
	);
}
