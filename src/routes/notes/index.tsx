import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getNotesQueryOptions } from "@/hooks/notes";
import { createNote } from "@/lib/db/notes";

export const Route = createFileRoute("/notes/")({
	component: RouteComponent,
	loader: async () => {},
});

function RouteComponent() {
	const { data, refetch } = useQuery(getNotesQueryOptions());

	const createNoteHandler = async () => {
		const name = prompt("Enter note name:");
		if (name) {
			// Here you would call a function to create the note in the database
			const newNoteId = await createNote(name);
			refetch();

			throw redirect({
				to: "/notes/$notesId",
				params: {
					notesId: newNoteId,
				},
			});
		}
	};

	return (
		<div className=" px-4 py-6">
			<h1>Notes</h1>

			<div>
				<Button onClick={createNoteHandler}>Create note</Button>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{data?.map((note) => (
					<div key={note.name} className="border p-4 rounded">
						<h2 className="font-bold">{note.name}</h2>
						<p className="text-sm text-gray-500">
							Last updated: {new Date(note.updatedAt).toLocaleString()}
						</p>
						<Link
							to="/notes/$notesId"
							params={{ notesId: note.id }}
							className="text-blue-500 hover:underline"
						>
							View Note
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
