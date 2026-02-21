import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Trash } from "lucide-react";
import { useRef } from "react";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import {
	deleteNoteMutationOptions,
	getNoteQueryOptions,
	saveNoteMutationOptions,
} from "@/lib/query-options";

export const Route = createFileRoute("/notes/$notesId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		context.queryClient.ensureQueryData(getNoteQueryOptions(params.notesId));
	},
	ssr: false,
});

function RouteComponent() {
	const { notesId } = Route.useParams();
	const navigate = useNavigate();

	const { data } = useQuery(getNoteQueryOptions(notesId));

	const saveNoteMutation = useMutation(saveNoteMutationOptions());
	const deleteNoteMutation = useMutation(deleteNoteMutationOptions());

	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	if (!data) {
		throw notFound();
	}

	const handleChange = (content: string) => {
		// Clear previous timeout if user is still typing
		if (debounceRef.current) clearTimeout(debounceRef.current);

		// Set new timeout
		debounceRef.current = setTimeout(() => {
			saveNoteMutation.mutate({ id: notesId, editorState: content });
		}, 500); // 500ms debounce
	};

	return (
		<main className="pl-0 pr-4 md:pl-4 max-w-4xl mx-auto my-8">
			<div className="flex items-center justify-center gap-2 mb-8">
				<Button
					className="mt-2"
					onClick={() => {
						deleteNoteMutation.mutate(notesId, {
							onSuccess: () => {
								return navigate({ to: "/notes" });
							},
						});
					}}
					variant="destructive"
					size="icon"
					disabled={deleteNoteMutation.isPending}
				>
					<Trash />
				</Button>
				<h1 className="font-black text-3xl md:text-5xl text-center">
					{data.name}
				</h1>
			</div>
			<Editor
				key={data.id}
				defaultEditorState={data.editorState ? data.editorState : undefined}
				onChange={handleChange}
			/>
		</main>
	);
}
