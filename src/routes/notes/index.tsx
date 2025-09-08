import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { Notebook, NotebookPen, NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dbCreateNote } from "@/lib/db/local/notes";
import {
	createNoteMutationOptions,
	getNotesQueryOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/notes/")({
	component: NotesComponent,
	loader: async () => {},
});

function NotesComponent() {
	const navigate = useNavigate();
	const { data } = useQuery(getNotesQueryOptions());
	const { mutate: createNote } = useMutation(createNoteMutationOptions());

	const createNoteHandler = async () => {
		createNote(
			{},
			{
				onSuccess: (data) => {
					navigate({
						to: "/notes/$notesId",
						params: {
							notesId: data.id,
						},
					});
				},
			},
		);
	};

	return (
		<div className="pl-0 pr-4 md:pl-4 py-12 flex flex-col items-center justify-center max-w-4xl mx-auto gap-4">
			<h1 className="text-5xl font-bold">All notes</h1>

			<div className="flex gap-2 mt-6 md:mt-8">
				<Button type="button" onClick={createNoteHandler}>
					<NotebookPen />
					Quick Note
				</Button>
				<Button variant="outline" onClick={createNoteHandler}>
					<NotebookText />
					Create new Note
				</Button>
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
