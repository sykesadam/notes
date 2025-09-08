import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Notebook, NotebookPen, NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNoteMutationOptions } from "@/lib/query-options";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const navigate = useNavigate();
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
			<h1 className="text-5xl font-bold">Create a note</h1>

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

			<div>
				<Button variant="link" asChild>
					<Link to="/notes">
						<Notebook />
						View Notes
					</Link>
				</Button>
			</div>
		</div>
	);
}
