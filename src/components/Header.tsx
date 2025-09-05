import { Link } from "@tanstack/react-router";
import { Notebook } from "lucide-react";

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-white text-black justify-between">
			<nav className="flex flex-row">
				<Link
					to="/notes"
					className="p-2 font-bold flex items-center gap-1 hover:underline"
				>
					<Notebook />
					<span className="sr-only">Home</span>
				</Link>
			</nav>
		</header>
	);
}
