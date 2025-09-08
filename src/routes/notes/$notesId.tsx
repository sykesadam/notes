import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useRef } from "react";
import { Editor } from "@/components/editor/editor";
import {
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
	const { data } = useQuery(getNoteQueryOptions(notesId));

	const saveNoteMutation = useMutation(saveNoteMutationOptions());

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
			<h1 className="font-black text-3xl md:text-5xl mb-8 text-center">
				{data.name}
			</h1>
			<Editor
				key={data.id}
				defaultEditorState={data.editorState ? data.editorState : undefined}
				onChange={handleChange}
			/>
		</main>
	);
}
